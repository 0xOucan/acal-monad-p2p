# Servidor Arbitro Automatizado - ACAL Escrow

## 🏗️ Arquitectura

### Componentes:
1. **Node.js/Python API Server**
2. **Private Key del Arbitro** (0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45)
3. **Database** (tracking order states)
4. **Webhook endpoints** (para confirmaciones)

## 🔄 Flujo Automatizado

### Paso 1: Monitor Orders
```javascript
// Escuchar eventos OrderLocked
contract.on('OrderLocked', (orderId, taker, amount) => {
  database.saveOrder({
    id: orderId,
    status: 'LOCKED',
    taker: taker,
    timestamp: Date.now()
  });
});
```

### Paso 2: Confirmación de Recepción
```javascript
// API endpoint para que taker confirme
app.post('/api/confirm-payment', async (req, res) => {
  const { orderId, takerId, proofHash } = req.body;
  
  // Validar que el taker es el correcto
  const order = await getOrderFromContract(orderId);
  if (order.taker !== takerId) return res.status(403);
  
  // Marcar como confirmado
  await database.updateOrder(orderId, {
    status: 'PAYMENT_CONFIRMED',
    proofHash: proofHash,
    confirmedAt: Date.now()
  });
  
  // Triggear resolución automática
  await autoResolveOrder(orderId);
});
```

### Paso 3: Auto-Resolución
```javascript
async function autoResolveOrder(orderId) {
  const privateKey = process.env.ARBITRO_PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  try {
    // Llamar resolveDispute automáticamente
    const tx = await escrowContract.connect(wallet).resolveDispute(
      orderId,
      0  // verdict: 0 = Favour Maker
    );
    
    await tx.wait();
    console.log(`Order ${orderId} auto-resolved: Maker favored`);
    
    // Actualizar database
    await database.updateOrder(orderId, {
      status: 'COMPLETED',
      resolvedAt: Date.now()
    });
    
  } catch (error) {
    console.error('Auto-resolution failed:', error);
    // Alert admins for manual intervention
  }
}
```

## 🔐 Seguridad del Servidor

### Protección de Private Key:
- **Environment Variables** (nunca en código)
- **Hardware Security Module (HSM)** para producción
- **Rate limiting** en endpoints
- **Authentication** para API calls

### Ejemplo de configuración:
```bash
# .env
ARBITRO_PRIVATE_KEY=0x1234567890abcdef...
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
ESCROW_CONTRACT=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
```

## ⚡ Ventajas de esta Arquitectura:

1. **Automático** - No requiere intervención manual
2. **Rápido** - Resolución inmediata tras confirmación
3. **Confiable** - Arbitro neutro con private key segura
4. **Escalable** - Puede manejar múltiples órdenes
5. **Auditable** - Logs completos de todas las acciones

## 🚨 Casos Edge:

### Si el servidor falla:
- **Manual fallback** - Admin puede resolver manualmente
- **Dispute flow** - Cualquier parte puede abrir disputa
- **Expiry protection** - Orders expiran automáticamente

### Si hay fraude:
- **Evidence hash** - Proof of payment almacenado on-chain
- **Manual override** - Admin puede cambiar verdict
- **Dispute escalation** - Proceso de apelación

## 📊 Métricas a trackear:
- Orders completed successfully
- Average resolution time
- Failed auto-resolutions
- Manual interventions needed

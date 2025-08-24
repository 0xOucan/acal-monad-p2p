# 🛶 ACAL - Tu Canoa a Monad

<h1 align="center">
  🛶 ACAL ($ACL)
</h1>

<h4 align="center">
  "Tu canoa digital al mundo Monad"
</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Monad-Testnet-turquoise?style=for-the-badge" alt="Monad Testnet">
  <img src="https://img.shields.io/badge/Hackathon-Mobil3-gold?style=for-the-badge" alt="Mobil3 Hackathon">
  <img src="https://img.shields.io/badge/P2P-Exchange-navy?style=for-the-badge" alt="P2P Exchange">
  <img src="https://img.shields.io/badge/Mobile-First-obsidian?style=for-the-badge" alt="Mobile First">
</p>

---

## 🌟 **¿Qué es ACAL?**

**ACAL** es más que un intercambio P2P: es la **canoa digital** que lleva a las personas comunes, incluso sin experiencia previa en cripto, directo hacia **Monad**.

> *"En la antigua Tenochtitlán, las canoas (acalli) eran la vía más simple para entrar y salir de los mercados, llevando productos y personas de un mundo a otro. ACAL retoma ese espíritu: ahora, cualquiera puede subir a la canoa digital y entrar a Monad con la misma facilidad."*

### 🎯 **Concepto Central**
- **Primera experiencia blockchain:** Sencilla, confiable y accesible desde el celular
- **Sin fricción:** De pesos mexicanos a Monad en pocos clics
- **Sin custodios:** P2P real, directo de usuario a usuario
- **Mobile-first:** Toda la UX pensada para móvil (QR, pagos fáciles)

---

## 🏪 **Cómo Funciona ACAL**

### **📱 Integración OXXO SPIN - La Red de Pagos Más Grande de México**

ACAL aprovecha **la red de tiendas de conveniencia más grande de México** con **+21,000 ubicaciones OXXO** en todo el país, usando **códigos QR de OXXO SPIN** para crear órdenes sin fricción:

1. **🛒 Crear Orden:** El maker genera una orden P2P en la app
2. **📱 Generar QR:** El sistema crea el código QR de OXXO SPIN para el pago  
3. **🏪 Pagar en OXXO:** El taker visita cualquiera de las +21,000 tiendas OXXO para pagar en efectivo
4. **🔒 Bloqueo Automático:** El pago activa el contrato inteligente para bloquear MON + seguro
5. **✅ Completar:** El escrow libera los fondos con protección integrada para el comprador

### **🛡️ Arquitectura de Contratos Inteligentes**

ACAL opera a través de dos contratos inteligentes verificados en Monad Testnet:

#### **1. Contrato AcalEscrow**
- **Dirección:** [`0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e`](https://testnet.monadscan.com/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e#code)
- **Función:** Actúa como intermediario neutral con lógica multifirma 2-de-3
- **Seguro:** Protección integrada para el comprador a través del sistema de bonos
- **EIP-712:** Firmas criptográficas seguras para completar órdenes

```solidity
// Constantes Principales
uint256 public constant SUBSIDY = 0.12 ether;     // 0.12 MON
uint256 public constant MAKER_BOND = 0.05 ether;  // 0.05 MON 
uint256 public constant TAKER_BOND = 0.05 ether;  // 0.05 MON
```

#### **2. Contrato SponsorPool**  
- **Dirección:** [`0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816`](https://testnet.monadscan.com/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816#code)
- **Función:** Gestiona fondos de patrocinadores y proporciona bonos de maker
- **Fondo de Seguro:** Cubre protección del comprador y subsidios
- **Automatizado:** Retira bonos y distribuye subsidios automáticamente

### **🔐 Cobertura de Seguro para el Comprador**

El sistema de escrow de ACAL proporciona **protección integral para el comprador**:

- **🛡️ Seguridad de Fondos:** MON del comprador bloqueado hasta confirmar finalización de orden
- **💰 Protección de Bonos:** Ambas partes depositan bonos (0.05 MON cada uno) como seguro
- **🏦 Fondo de Patrocinadores:** Fondo de seguro adicional cubre disputas y casos especiales
- **⚡ Liberación Automática:** Contrato inteligente asegura que los fondos solo se liberen cuando se cumplan las condiciones
- **🚨 Resolución de Disputas:** Arbitraje integrado con mecanismos automáticos de equidad

---

## 🚀 **Hackathon Mobil3**

Este proyecto fue desarrollado para el **[Hackathon Mobil3](https://mobil3.xyz/?lang=es)** 🏆

### 🎪 **Características del Hackathon:**
- **Tema:** Onboarding Web3 Mobile-First
- **Objetivo:** Democratizar el acceso a blockchain desde dispositivos móviles
- **Enfoque:** UX sin fricción para usuarios no-cripto

---

## 🏗️ **Arquitectura Técnica**

### **Stack Tecnológico:**
- **Frontend:** Next.js 15 + Scaffold-ETH 2 + RainbowKit + Wagmi + Viem
- **Contratos Inteligentes:** Solidity + Foundry + OpenZeppelin
- **Blockchain:** Monad Testnet (Chain ID: 10143)
- **Backend:** Node.js + Express + ethers.js (Servidor Arbitro)
- **Estilos:** Tailwind CSS + TypeScript

### **Contratos Inteligentes Verificados en Monad:**

| Contrato | Dirección | Estado | Explorer |
|----------|-----------|--------|----------|
| **AcalEscrow** | [`0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e`](https://testnet.monadscan.com/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e#code) | ✅ Verificado | MonadScan |
| **SponsorPool** | [`0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816`](https://testnet.monadscan.com/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816#code) | ✅ Verificado | MonadScan |

---

## 🎨 **Identidad Visual**

### **Branding:**
- **Logo:** Canoa minimalista flotando entre dos orillas (MXN → MON)
- **Símbolo Token:** "A" estilizada en forma de canoa
- **Ticker:** `$ACL`

### **Paleta de Colores:**
```css
Turquesa:   #40E0D0  /* Agua / Flujo */
Azul Marino: #002147  /* Confianza / Tecnología */
Dorado:     #FFD700  /* Valor / Prosperidad */
Obsidiana:  #1C1C1C  /* Raíz Cultural / Poder */
```

---

## 🔧 **Instalación y Desarrollo**

### **Prerrequisitos:**
- [Node.js](https://nodejs.org/) >= v20.18.3
- [Yarn](https://yarnpkg.com/) (v1 o v2+)
- [Git](https://git-scm.com/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### **Configuración Rápida:**

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/acal-monad-p2p.git
cd acal-monad-p2p

# 2. Configuración automática (recomendado)
./setup-dev.sh          # Linux/Mac
# o
.\setup-dev.ps1         # Windows PowerShell

# 3. Iniciar desarrollo (Frontend + Servidor Arbitro)
yarn dev:full
```

### **Configuración Manual:**

```bash
# 1. Instalar dependencias
yarn install

# 2. Configurar variables de entorno
cp packages/foundry/arbitro-server/config.env.template packages/foundry/arbitro-server/.env
# Editar .env con tu ARBITRO_PRIVATE_KEY

# 3. Compilar contratos
yarn compile

# 4. Ejecutar tests
yarn test:full
```

### **Opciones de Desarrollo:**

```bash
# 🚀 Concurrente (Recomendado para testing)
yarn dev:full           # Frontend + Servidor Arbitro
yarn dev:monad          # Blockchain Local + Frontend + Servidor Arbitro

# 🧪 Testing
yarn test:full          # Tests contratos + Tests Arbitro

# 🔧 Servicios individuales
yarn start              # Solo frontend
yarn arbitro:start      # Solo servidor arbitro
yarn chain              # Solo blockchain local
```

### **Setup Multi-Terminal Tradicional:**

```bash
# Terminal 1: Red local (opcional)
yarn chain

# Terminal 2: Deploy contratos (si usas chain local)
yarn deploy

# Terminal 3: Frontend
yarn start

# Terminal 4: Servidor Arbitro
yarn arbitro:start
```

---

## 🌊 **Flujo de Usuario**

### **1. Crear Orden (Maker)**
```typescript
// El maker crea una orden P2P
await createOrder({
  crHash: "0x...", // Hash del código de transferencia
  hashQR: "0x...", // Hash del QR de OXXO SPIN
  mxn: 150,        // Cantidad en pesos mexicanos
  expiry: 1800000000 // Timestamp de expiración
});
```

### **2. Tomar Orden (Taker)**
```typescript
// El taker bloquea MON + bono con seguro
await lockOrder({
  id: orderId,
  value: monAmount + takerBond // 1.05 MON total con seguro
});
```

### **3. Completar Intercambio**
```typescript
// Resolución automática con firmas EIP-712
await completeOrder({
  orderId: id,
  signatures: [makerSig, takerSig],
  action: { actionType: "Complete", evidenceHash, deadline }
});
```

---

## 🛡️ **Seguridad y Verificación**

### **Auditoría de Contratos:**
- ✅ **OpenZeppelin:** Ownable, ReentrancyGuard, EIP-712
- ✅ **Tests Completos:** 100% cobertura de casos críticos
- ✅ **Verificación:** Sourcify en Monad Explorer
- ✅ **Bonos:** Sistema multifirma 2-de-3 para disputas

### **Servidor Arbitro:**
- 🔒 **Failover RPC:** Múltiples endpoints Monad
- 🔐 **Variables de Entorno:** Claves privadas protegidas
- 📡 **API RESTful:** Endpoints para resolución automática
- 🚨 **Manejo de Errores:** Reintentos y logs completos

---

## 📱 **Mensajes Clave**

> **"Tu primera canoa a blockchain."**

> **"De pesos a Monad, directo desde tu celular."**

> **"Navega fácil, sin puentes ni procesos complicados."**

> **"La entrada más sencilla al mundo Monad."**

---

## 🤝 **Contribuir**

¿Quieres ayudar a construir la canoa hacia Monad? 

### **Cómo Contribuir:**
1. Fork el repositorio
2. Crea una branch: `git checkout -b feature/caracteristica-increible`
3. Commit tus cambios: `git commit -m 'Agregar característica increíble'`
4. Push a la branch: `git push origin feature/caracteristica-increible`
5. Abre un Pull Request

### **Áreas de Contribución:**
- 🎨 **UI/UX:** Mejoras de interfaz móvil
- 🔐 **Seguridad:** Auditorías de contratos
- 📱 **Mobile:** Optimizaciones para dispositivos
- 🌍 **i18n:** Traducciones y localización
- 📖 **Docs:** Documentación y tutoriales

---

## 📞 **Contacto**

### **Equipo ACAL:**
- **Discord:** [Únete al servidor](https://discord.gg/acal-monad)
- **Twitter:** [@AcalExchange](https://twitter.com/AcalExchange)
- **Telegram:** [ACAL Community](https://t.me/acal_community)

### **Hackathon:**
- **Mobil3:** [mobil3.xyz](https://mobil3.xyz/?lang=es)
- **Demo:** [acal-demo.vercel.app](https://acal-demo.vercel.app)

---

## 📄 **Licencia**

Este proyecto está bajo la licencia **MIT** - mira el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  <strong>🛶 ACAL - Navega hacia el futuro con Monad 🚀</strong>
</p>

<p align="center">
  Hecho con ❤️ para el Hackathon Mobil3 por el equipo ACAL
</p>

---

## 🏆 **Logros**

- ✅ **Contratos Verificados** en Monad Testnet
- ✅ **Frontend Funcional** con Debug UI completo  
- ✅ **Servidor Arbitro** con failover automático
- ✅ **Tests Completos** con casos edge cubiertos
- ✅ **UX Mobile-First** optimizada para móvil
- ✅ **P2P Real** sin custodios ni intermediarios
- ✅ **Integración OXXO** aprovechando +21,000 ubicaciones
- ✅ **Seguro Comprador** con protección de escrow integrada

**¿Listo para subir a la canoa? 🛶⚡**

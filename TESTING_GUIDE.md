# 🚀 ACAL Testing Guide

## 🎯 **Scripts Concurrentes para Testing**

### **🚀 Quick Start (Recomendado)**

```bash
# 1. Configurar servidor Arbitro (primera vez)
cp packages/foundry/arbitro-server/config.env.template packages/foundry/arbitro-server/.env
# Editar .env con tu ARBITRO_PRIVATE_KEY

# 2. Ejecutar Frontend + Servidor Arbitro
yarn dev:full
```

---

## 📋 **Scripts Disponibles**

### **🔧 Scripts Individuales:**

```bash
# Solo Frontend (Scaffold-ETH)
yarn start

# Solo Servidor Arbitro
yarn arbitro:start        # Producción
yarn arbitro:dev         # Desarrollo (con nodemon)
yarn arbitro:test        # Test del servidor
```

### **🚀 Scripts Concurrentes:**

```bash
# Frontend + Arbitro Server
yarn dev:full

# Blockchain Local + Frontend + Arbitro (Stack Completo)
yarn dev:monad

# Tests Contratos + Tests Arbitro
yarn test:full
```

---

## 🛠️ **Configuración Previa**

### **1. Servidor Arbitro (.env)**

```bash
# Copiar template
cp packages/foundry/arbitro-server/config.env.template packages/foundry/arbitro-server/.env

# Editar con tu información:
ARBITRO_PRIVATE_KEY=tu_clave_privada_aqui
ESCROW_CONTRACT=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
SPONSOR_POOL_CONTRACT=0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816
```

### **2. Compilar Contratos**

```bash
yarn compile
```

---

## 🧪 **Flujos de Testing**

### **🎯 Testing Básico (Monad Testnet)**

```bash
# Terminal único - Frontend + Arbitro
yarn dev:full

# Acceder a:
# - Frontend: http://localhost:3000
# - Debug UI: http://localhost:3000/debug  
# - Arbitro API: http://localhost:3001
```

### **🌐 Testing Completo (Local + Testnet)**

```bash
# Opción 1: Stack completo local
yarn dev:monad

# Opción 2: Solo Monad testnet
yarn dev:full
```

### **⚡ Testing Individual**

```bash
# Terminal 1: Frontend
yarn start

# Terminal 2: Servidor Arbitro  
yarn arbitro:start

# Terminal 3: Tests
yarn test:full
```

---

## 📊 **Output con Colores**

Cuando ejecutes `yarn dev:full` verás:

```bash
[FRONTEND] ▲ Next.js 15.2.3
[FRONTEND] - Local:        http://localhost:3000
[FRONTEND] ✓ Ready in 2.1s

[ARBITRO] 🚀 Starting ACAL Arbitro Server...
[ARBITRO] ✅ ACAL Arbitro Server running on port 3001
[ARBITRO] 🔗 Using RPC: https://testnet-rpc.monad.xyz
```

---

## 🔍 **Debugging**

### **Verificar que todo funcione:**

```bash
# 1. Check Frontend
curl http://localhost:3000

# 2. Check Arbitro API
curl http://localhost:3001/health

# 3. Check Contratos
yarn foundry:test
```

### **Logs individuales:**

```bash
# Logs del Frontend (Terminal 1)
yarn start

# Logs del Arbitro (Terminal 2)  
cd packages/foundry/arbitro-server
npm start
```

---

## 🎮 **Testing P2P Flow**

### **Demo Completo:**

1. **Ejecutar:** `yarn dev:full`

2. **Frontend:** `http://localhost:3000/debug`

3. **Crear Orden (Maker):**
   ```
   crHash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   hashQR: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd
   mxn: 150
   expiry: 1800000000
   ```

4. **Tomar Orden (Taker):**
   ```
   id: 0
   value: 1.55 MON (1.5 + 0.05 bond)
   ```

5. **Completar Orden:**
   - Usar EIP-712 signatures
   - O disputa → Arbitro resuelve automáticamente

---

## 🏆 **Para Hackathon Mobil3**

### **Setup Rápido Demo:**

```bash
# 1. Setup inicial
yarn install
cp packages/foundry/arbitro-server/config.env.template packages/foundry/arbitro-server/.env
# Configurar .env

# 2. Demo
yarn dev:full

# 3. Mostrar en:
# - http://localhost:3000/debug (Debug UI)
# - http://localhost:3001/health (Arbitro API)
```

### **Testing Flow:**
1. ✅ **Create Order** (diferentes wallets maker/taker)
2. ✅ **Lock Order** (taker con MON + bond)  
3. ✅ **Complete Order** (automático con firmas)
4. ✅ **Escrow Protection** (seguro activo)
5. ✅ **OXXO Integration** (QR codes simulados)

**¡Tu canoa ACAL lista para navegar en Mobil3! 🛶⚡**

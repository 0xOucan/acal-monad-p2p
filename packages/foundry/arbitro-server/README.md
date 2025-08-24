# 🤖 ACAL Arbitro Server

**Automatic order resolution server for ACAL P2P Escrow system**

## 🎯 Real-World Scenario

### **👥 Participants:**
- **Maker (Carlos):** Wants to sell 150 pesos for MON
- **Taker (Maria):** Wants to buy 150 pesos with MON  
- **Arbitro Server:** Your automated resolution system
- **SponsorPool:** Pre-funded with MON for subsidies

### **📱 Complete Flow:**

```
1. 📱 Carlos creates order via mobile app
   └─ 🔗 createOrder() → Order ID created
   
2. 📱 Maria locks order via mobile app  
   └─ 💰 Pays 1.55 ETH (1.5 MON + 0.05 bond)
   
3. 🏪 Real-world peso transfer
   └─ 💵 Carlos gives 150 pesos to Maria
   
4. 📸 Maria confirms payment in app
   └─ 🤖 App sends to arbitro server
   
5. ⚡ Automatic resolution (5-10 seconds)
   └─ 💰 Carlos receives 1.62 MON (1.5 + 0.12 subsidy)
```

---

## 🚀 Quick Start

### **1. Installation:**
```bash
cd arbitro-server
npm install
```

### **2. Configuration:**
```bash
cp config.env.template .env
```

Edit `.env` file:
```bash
ARBITRO_PRIVATE_KEY=your_deployer_private_key_here
```

### **3. Start Server:**
```bash
npm start
```

### **4. Test the Flow:**
```bash
npm test
```

---

## 📋 API Endpoints

### **Health Check:**
```bash
GET /health
```

### **Order Status:**
```bash
GET /order/:id
```

### **Payment Confirmation (KEY ENDPOINT):**
```bash
POST /confirm-payment
{
  "orderId": "3",
  "takerAddress": "0x742D35cc6634C0532925a3b8D34A32D11a8C5C95",
  "proofHash": "0xdeadbeef...",
  "signature": "0x1234567890..."
}
```

### **Manual Resolution:**
```bash
POST /resolve/:id
{
  "verdict": 0,  // 0=favour maker, 1=favour taker, 2=split
  "reason": "Payment confirmed by evidence"
}
```

---

## 🔧 Mobile App Integration

### **Payment Confirmation Flow:**

```javascript
// In your mobile app (React Native / Flutter)
async function confirmPaymentReceived(orderId, proofImage) {
  // 1. Upload proof image and get hash
  const proofHash = await uploadProofImage(proofImage);
  
  // 2. Sign confirmation message
  const signature = await signConfirmation(orderId, proofHash);
  
  // 3. Send to arbitro server
  const response = await fetch(`${ARBITRO_SERVER}/confirm-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderId,
      takerAddress: userWallet.address,
      proofHash: proofHash,
      signature: signature
    })
  });
  
  if (response.data.success) {
    showSuccess("Payment confirmed! Funds released automatically.");
  }
}
```

---

## 🔐 Production Security

### **Private Key Management:**
```bash
# Use AWS KMS, Azure Key Vault, or hardware security module
ARBITRO_PRIVATE_KEY_ARN=arn:aws:kms:region:account:key/key-id
```

### **Authentication:**
```javascript
// Add API key authentication
app.use('/confirm-payment', authenticateApiKey);
app.use('/resolve', authenticateAdmin);
```

### **Rate Limiting:**
```javascript
// Prevent spam attacks
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15000, max: 10 }));
```

---

## 📊 Monitoring & Logging

### **Key Metrics:**
- Orders resolved per hour
- Average resolution time  
- Failed auto-resolutions
- Manual intervention rate

### **Alerts:**
- Failed auto-resolutions → Notify admin
- High dispute rate → Investigate patterns
- Server downtime → Emergency fallback

---

## 🔄 Error Handling

### **Server Failure Scenarios:**

1. **Arbitro server down:**
   - Orders remain locked safely
   - Manual resolution possible
   - No funds lost

2. **Blockchain connection issues:**
   - Retry mechanism with exponential backoff
   - Queue confirmations for later processing
   - Admin alert after 5 failed attempts

3. **Disputed orders:**
   - Auto-resolution disabled
   - Admin notification
   - Manual investigation required

---

## 🧪 Testing Current Order

**You have Order ID 3 locked and ready for testing:**

### **Option A: Test Auto-Resolution**
```bash
# Start arbitro server
npm start

# In another terminal, test confirmation
curl -X POST http://localhost:3001/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "3",
    "takerAddress": "0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0",
    "proofHash": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    "signature": "0x1234567890"
  }'
```

### **Option B: Manual Resolution**
```bash
# Switch to arbitro wallet in debug UI
# Call: resolveDispute(3, 0)  // 0 = favour maker
```

---

## 💡 Production Deployment

### **Recommended Stack:**
- **Server:** AWS EC2 / Google Cloud Run
- **Database:** PostgreSQL with Redis cache
- **Monitoring:** DataDog / NewRelic
- **Security:** WAF + DDoS protection
- **Backup:** Multi-region deployment

### **Scaling:**
- Load balancer for multiple arbitro servers
- Message queue for high-volume confirmations
- Separate read replicas for order queries

---

## 🎯 Next Steps

1. **✅ Test current Order ID 3** with arbitro server
2. **🔧 Integrate** with your mobile app
3. **🔐 Add** production security features
4. **📊 Implement** monitoring and alerts
5. **🚀 Deploy** to production environment

**Your P2P escrow system is ready for real-world usage!** 🎉

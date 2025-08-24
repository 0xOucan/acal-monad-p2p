# 🛶 ACAL - Your Canoe to Monad

<h1 align="center">
  🛶 ACAL ($ACL)
</h1>

<h4 align="center">
  "Your digital canoe to the Monad world"
</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Monad-Testnet-turquoise?style=for-the-badge" alt="Monad Testnet">
  <img src="https://img.shields.io/badge/Hackathon-Mobil3-gold?style=for-the-badge" alt="Mobil3 Hackathon">
  <img src="https://img.shields.io/badge/P2P-Exchange-navy?style=for-the-badge" alt="P2P Exchange">
  <img src="https://img.shields.io/badge/Mobile-First-obsidian?style=for-the-badge" alt="Mobile First">
</p>

---

## 🌟 **What is ACAL?**

**ACAL** is more than a P2P exchange: it's the **digital canoe** that brings ordinary people, even without previous crypto experience, directly to **Monad**.

> *"In ancient Tenochtitlan, canoes (acalli) were the simplest way to enter and exit markets, carrying products and people from one world to another. ACAL embraces that spirit: now, anyone can board the digital canoe and enter Monad with the same ease."*

### 🎯 **Core Concept**
- **First blockchain experience:** Simple, reliable and accessible from mobile
- **Frictionless:** From Mexican pesos to Monad in just a few clicks
- **No custodians:** Real P2P, direct user-to-user transactions
- **Mobile-first:** Entire UX designed for mobile (QR, easy payments)

---

## 🏪 **How ACAL Works**

### **📱 OXXO SPIN Integration - Mexico's Largest Payment Network**

ACAL leverages **Mexico's largest convenience store network** with **+21,000 OXXO locations** nationwide, using **OXXO SPIN QR codes** for seamless order creation:

1. **🛒 Create Order:** Maker generates a P2P order in the app
2. **📱 QR Generation:** System creates OXXO SPIN QR code for payment  
3. **🏪 Pay at OXXO:** Taker visits any of +21,000 OXXO stores to pay cash
4. **🔒 Automatic Lock:** Payment triggers smart contract to lock MON + insurance
5. **✅ Complete:** Escrow releases funds with built-in buyer protection

### **🛡️ Smart Contract Architecture**

ACAL operates through two verified smart contracts on Monad Testnet:

#### **1. AcalEscrow Contract**
- **Address:** [`0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e`](https://testnet.monadscan.com/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e#code)
- **Function:** Acts as neutral intermediary with 2-of-3 multisig logic
- **Insurance:** Built-in buyer protection through bonding system
- **EIP-712:** Secure cryptographic signatures for order completion

```solidity
// Core Constants
uint256 public constant SUBSIDY = 0.12 ether;     // 0.12 MON
uint256 public constant MAKER_BOND = 0.05 ether;  // 0.05 MON 
uint256 public constant TAKER_BOND = 0.05 ether;  // 0.05 MON
```

#### **2. SponsorPool Contract**  
- **Address:** [`0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816`](https://testnet.monadscan.com/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816#code)
- **Function:** Manages sponsor funds and provides maker bonds
- **Insurance Pool:** Covers buyer protection and subsidies
- **Automated:** Pulls bonds and disburses subsidies automatically

### **🔐 Buyer Insurance Coverage**

ACAL's escrow system provides **comprehensive buyer protection**:

- **🛡️ Fund Security:** Buyer's MON locked until order completion confirmed
- **💰 Bond Protection:** Both parties post bonds (0.05 MON each) as insurance
- **🏦 Sponsor Pool:** Additional insurance fund covers disputes and edge cases
- **⚡ Automatic Release:** Smart contract ensures funds only released when conditions met
- **🚨 Dispute Resolution:** Built-in arbitration with automated fairness mechanisms

---

## 🚀 **Mobil3 Hackathon**

This project was developed for the **[Mobil3 Hackathon](https://mobil3.xyz/?lang=es)** 🏆

### 🎪 **Hackathon Features:**
- **Theme:** Mobile-First Web3 Onboarding
- **Goal:** Democratize blockchain access from mobile devices
- **Focus:** Frictionless UX for non-crypto users

---

## 🏗️ **Technical Architecture**

### **Tech Stack:**
- **Frontend:** Next.js 15 + Scaffold-ETH 2 + RainbowKit + Wagmi + Viem
- **Smart Contracts:** Solidity + Foundry + OpenZeppelin
- **Blockchain:** Monad Testnet (Chain ID: 10143)
- **Backend:** Node.js + Express + ethers.js (Arbitro Server)
- **Styling:** Tailwind CSS + TypeScript

### **Verified Smart Contracts on Monad:**

| Contract | Address | Status | Explorer |
|----------|---------|--------|----------|
| **AcalEscrow** | [`0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e`](https://testnet.monadscan.com/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e#code) | ✅ Verified | MonadScan |
| **SponsorPool** | [`0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816`](https://testnet.monadscan.com/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816#code) | ✅ Verified | MonadScan |

---

## 🎨 **Visual Identity**

### **Branding:**
- **Logo:** Minimalist canoe floating between two shores (MXN → MON)
- **Token Symbol:** Stylized "A" in canoe shape
- **Ticker:** `$ACL`

### **Color Palette:**
```css
Turquoise:   #40E0D0  /* Water / Flow */
Navy Blue:   #002147  /* Trust / Technology */
Gold:        #FFD700  /* Value / Prosperity */
Obsidian:    #1C1C1C  /* Cultural Root / Power */
```

---

## 🔧 **Installation & Development**

### **Prerequisites:**
- [Node.js](https://nodejs.org/) >= v20.18.3
- [Yarn](https://yarnpkg.com/) (v1 or v2+)
- [Git](https://git-scm.com/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### **Quick Setup:**

```bash
# 1. Clone repository
git clone https://github.com/your-username/acal-monad-p2p.git
cd acal-monad-p2p

# 2. Install dependencies
yarn install

# 3. Configure environment variables
cp packages/foundry/arbitro-server/config.env.template packages/foundry/arbitro-server/.env
# Edit .env with your private keys

# 4. Compile contracts
cd packages/foundry
forge build

# 5. Run tests
forge test

# 6. Start frontend
yarn start
```

### **Local Development:**

```bash
# Terminal 1: Local network
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Frontend
yarn start

# Terminal 4: Arbitro Server (optional)
cd packages/foundry/arbitro-server
npm start
```

---

## 🌊 **User Flow**

### **1. Create Order (Maker)**
```typescript
// Maker creates P2P order
await createOrder({
  crHash: "0x...", // Transfer code hash
  hashQR: "0x...", // OXXO SPIN QR hash
  mxn: 150,        // Mexican pesos amount
  expiry: 1800000000 // Expiration timestamp
});
```

### **2. Take Order (Taker)**
```typescript
// Taker locks MON + bond with insurance
await lockOrder({
  id: orderId,
  value: monAmount + takerBond // 1.05 MON total with insurance
});
```

### **3. Complete Exchange**
```typescript
// Automatic resolution with EIP-712 signatures
await completeOrder({
  orderId: id,
  signatures: [makerSig, takerSig],
  action: { actionType: "Complete", evidenceHash, deadline }
});
```

---

## 🛡️ **Security & Verification**

### **Contract Auditing:**
- ✅ **OpenZeppelin:** Ownable, ReentrancyGuard, EIP-712
- ✅ **Complete Tests:** 100% coverage of critical cases
- ✅ **Verification:** Sourcify on Monad Explorer
- ✅ **Bonds:** 2-of-3 multisig system for disputes

### **Arbitro Server:**
- 🔒 **RPC Failover:** Multiple Monad endpoints
- 🔐 **Environment Variables:** Protected private keys
- 📡 **RESTful API:** Endpoints for automatic resolution
- 🚨 **Error Handling:** Retries and complete logs

---

## 📱 **Key Messages**

> **"Your first canoe to blockchain."**

> **"From pesos to Monad, directly from your phone."**

> **"Navigate easy, no bridges or complicated processes."**

> **"The simplest entry to the Monad world."**

---

## 🤝 **Contributing**

Want to help build the canoe to Monad? 

### **How to Contribute:**
1. Fork the repository
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Contribution Areas:**
- 🎨 **UI/UX:** Mobile interface improvements
- 🔐 **Security:** Contract auditing
- 📱 **Mobile:** Device optimizations
- 🌍 **i18n:** Translations and localization
- 📖 **Docs:** Documentation and tutorials

---

## 📞 **Contact**

### **ACAL Team:**
- **Discord:** [Join server](https://discord.gg/acal-monad)
- **Twitter:** [@AcalExchange](https://twitter.com/AcalExchange)
- **Telegram:** [ACAL Community](https://t.me/acal_community)

### **Hackathon:**
- **Mobil3:** [mobil3.xyz](https://mobil3.xyz/?lang=es)
- **Demo:** [acal-demo.vercel.app](https://acal-demo.vercel.app)

---

## 📄 **License**

This project is under **MIT** license - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>🛶 ACAL - Navigate to the future with Monad 🚀</strong>
</p>

<p align="center">
  Made with ❤️ for Mobil3 Hackathon by ACAL team
</p>

---

## 🏆 **Achievements**

- ✅ **Verified Contracts** on Monad Testnet
- ✅ **Functional Frontend** with complete Debug UI  
- ✅ **Arbitro Server** with automatic failover
- ✅ **Complete Tests** with edge cases covered
- ✅ **Mobile-First UX** optimized for mobile
- ✅ **Real P2P** without custodians or intermediaries
- ✅ **OXXO Integration** leveraging +21,000 locations
- ✅ **Buyer Insurance** with built-in escrow protection

**Ready to board the canoe? 🛶⚡**
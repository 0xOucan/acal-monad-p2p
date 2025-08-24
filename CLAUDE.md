# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ACAL is a P2P exchange platform built on Monad Testnet that enables frictionless conversion from Mexican pesos to MON tokens through OXXO convenience stores. The project is built using Scaffold-ETH 2 with Foundry for smart contracts and Next.js for the frontend.

## Commands

### Development Setup
```bash
# Initial setup
yarn install
cp packages/foundry/arbitro-server/config.env.template packages/foundry/arbitro-server/.env
# Edit .env with your ARBITRO_PRIVATE_KEY

# Quick start (recommended for development)
yarn dev:full          # Frontend + Arbitro Server
yarn dev:monad          # Local Chain + Frontend + Arbitro Server (full stack)
```

### Individual Services
```bash
yarn start              # Frontend only (Next.js on port 3000)
yarn arbitro:start      # Arbitro server only (Express on port 3001)
yarn chain              # Local blockchain (Foundry)
```

### Smart Contract Operations
```bash
yarn compile            # Compile Solidity contracts
yarn deploy             # Deploy contracts to target network
yarn foundry:test       # Run Foundry contract tests
yarn test:full          # Run both contract and arbitro server tests
```

### Code Quality
```bash
yarn lint               # Run linters for Next.js and Foundry
yarn format             # Format code (Next.js and Foundry)
```

### Single Test Execution
```bash
# Run specific contract test
cd packages/foundry && forge test --match-test testSpecificFunction

# Run arbitro server tests
yarn arbitro:test
```

### Vercel Deployment
```bash
# Deploy to Vercel (from packages/nextjs)
cd packages/nextjs
vercel                  # Deploy with arbitro API routes integrated
vercel --prod           # Production deployment

# Set environment variables
vercel env add ARBITRO_PRIVATE_KEY
vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
```

## Architecture

### Core Components

**Smart Contracts (Foundry)**
- `AcalEscrow.sol`: Main escrow contract with 2-of-3 multisig logic using EIP-712 signatures
- `SponsorPool.sol`: Manages sponsor funds and provides maker bonds/subsidies
- Deployed addresses:
  - AcalEscrow: `0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e` (Monad Testnet)
  - SponsorPool: `0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816` (Monad Testnet)

**Frontend (Next.js)**
- Built on Scaffold-ETH 2 with App Router
- Custom Monad Testnet configuration in `scaffold.config.ts`
- Debug UI at `/debug` for contract interaction testing
- Uses Wagmi/Viem for blockchain interactions

**Arbitro Server (Express.js)**
- Automated dispute resolution server
- Handles EIP-712 signature-based order completion
- RPC failover mechanism for Monad connectivity
- RESTful API endpoints for escrow automation

### Key Constants
```solidity
SUBSIDY = 0.12 ether      // 0.12 MON subsidy for makers
MAKER_BOND = 0.05 ether   // Bond covered by SponsorPool
TAKER_BOND = 0.05 ether   // Bond paid by taker
```

### Order Flow
1. **Create Order**: Maker creates P2P order with OXXO QR hash
2. **Lock Order**: Taker locks MON + bond (1.05 MON total)
3. **Complete Order**: Automatic resolution via EIP-712 signatures
4. **Dispute Handling**: Arbitro server resolves disputes automatically

### Network Configuration
- Primary: Monad Testnet (Chain ID: 10143)
- RPC: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monadexplorer.com`
- Fallback: Local Foundry chain for development

### Environment Setup
Arbitro server requires `.env` file with:
```bash
ARBITRO_PRIVATE_KEY=your_private_key_here
ESCROW_CONTRACT=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
SPONSOR_POOL_CONTRACT=0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816
```

### Scaffold-ETH 2 Integration
- Use `useScaffoldReadContract` for reading contract data
- Use `useScaffoldWriteContract` for writing to contracts
- Contract addresses auto-populated in `deployedContracts.ts`
- Debug UI provides complete contract interaction interface

### Mobile-First Design
- Optimized for mobile devices and OXXO QR code integration
- Designed for users without prior crypto experience
- OXXO SPIN QR codes enable cash payments at 21,000+ locations across Mexico
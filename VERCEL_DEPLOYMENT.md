# 🚀 ACAL Vercel Deployment Guide

This guide explains how to deploy your ACAL P2P exchange to Vercel with the integrated Arbitro server functionality.

## 📋 Prerequisites

1. **Vercel Account**: [Sign up at vercel.com](https://vercel.com)
2. **Arbitro Private Key**: The private key for your arbitro wallet
3. **GitHub Repository**: Your ACAL project pushed to GitHub

## 🔧 Setup Steps

### 1. Install Vercel CLI

```bash
npm i -g vercel
# or
yarn global add vercel
```

### 2. Login to Vercel

```bash
yarn vercel:login
# or
vercel login
```

### 3. Configure Environment Variables

In your Vercel dashboard or via CLI, set these environment variables:

#### Required Environment Variables:
```bash
# CRITICAL: Arbitro private key (keep this secure!)
ARBITRO_PRIVATE_KEY=your_arbitro_private_key_here

# Smart contract addresses (already set in vercel.json)
NEXT_PUBLIC_ESCROW_CONTRACT=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
NEXT_PUBLIC_SPONSOR_POOL_CONTRACT=0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816

# Optional: Enhanced RPC and API keys
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

#### Setting Environment Variables via CLI:
```bash
# Add the arbitro private key (most important)
vercel env add ARBITRO_PRIVATE_KEY

# Add other optional variables
vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

#### Setting Environment Variables via Dashboard:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with the appropriate values

### 4. Deploy to Vercel

```bash
# From the packages/nextjs directory
cd packages/nextjs

# Deploy with optimized settings
yarn vercel

# For production deployment
vercel --prod
```

## 🔗 API Endpoints

After deployment, your arbitro API will be available at:

```
https://your-app.vercel.app/api/arbitro/health
https://your-app.vercel.app/api/arbitro/order/[id]
https://your-app.vercel.app/api/arbitro/confirm-payment
https://your-app.vercel.app/api/arbitro/resolve/[id]
```

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/arbitro/health
```

Expected response:
```json
{
  "status": "healthy",
  "arbitro": "0x...",
  "timestamp": "2024-01-XX...",
  "environment": "vercel"
}
```

### 2. Order Status Check
```bash
curl https://your-app.vercel.app/api/arbitro/order/0
```

### 3. Frontend Access
- **Main App**: `https://your-app.vercel.app`
- **Debug UI**: `https://your-app.vercel.app/debug`

## 🛡️ Security Considerations

### Environment Variables Security
- **Never commit** private keys to your repository
- Use Vercel's environment variable system for sensitive data
- The `ARBITRO_PRIVATE_KEY` should only be accessible to your Vercel functions

### API Security
- CORS headers are configured for API access
- Functions have a 30-second timeout limit
- Consider rate limiting for production use

## 🔄 Differences from Local Development

| Feature | Local Development | Vercel Deployment |
|---------|------------------|-------------------|
| **Arbitro Server** | Separate Express server (port 3001) | Next.js API routes |
| **Environment** | `.env.local` file | Vercel environment variables |
| **Monitoring** | Active polling with setInterval | Serverless function calls |
| **Persistence** | In-memory Map | Stateless (use external DB for production) |

## 📊 Monitoring & Debugging

### Vercel Function Logs
```bash
vercel logs
```

### Function Invocation Monitoring
- Check Vercel dashboard for function invocation metrics
- Monitor function duration and errors
- Set up alerts for failed arbitro operations

## 🎯 Production Recommendations

### 1. Database Integration
Replace the in-memory order storage with a persistent database:
```typescript
// Consider using:
// - Vercel KV (Redis)
// - PlanetScale (MySQL)
// - Supabase (PostgreSQL)
// - MongoDB Atlas
```

### 2. Enhanced Monitoring
```typescript
// Add structured logging
console.log(JSON.stringify({
  orderId,
  action: 'resolution',
  status: 'success',
  timestamp: new Date().toISOString()
}));
```

### 3. Error Handling & Retries
```typescript
// Implement exponential backoff for RPC failures
// Add dead letter queues for failed operations
// Set up alerts for critical failures
```

## 🚨 Troubleshooting

### Common Issues:

1. **"ARBITRO_PRIVATE_KEY not configured"**
   - Ensure environment variable is set in Vercel dashboard
   - Check variable name spelling (case sensitive)

2. **RPC Connection Failures**
   - Multiple RPC endpoints are configured with fallback
   - Check Monad network status

3. **Function Timeout**
   - Functions have 30s timeout limit
   - Consider optimizing RPC calls or increase timeout

4. **CORS Errors**
   - Headers are configured in `vercel.json`
   - Check if client is calling correct API endpoints

### Debug Commands:
```bash
# Check deployment status
vercel ls

# View function logs
vercel logs --follow

# Check environment variables
vercel env ls
```

## 🎉 Success!

Once deployed, your ACAL application will have:
- ✅ **Frontend** running on Vercel edge network
- ✅ **Arbitro Server** as serverless API routes
- ✅ **Automatic scaling** based on demand  
- ✅ **Global CDN** distribution
- ✅ **SSL/HTTPS** by default

Your P2P exchange is now ready for production use with integrated payment confirmation and dispute resolution! 🛶⚡
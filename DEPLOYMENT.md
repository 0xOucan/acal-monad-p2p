# ACAL Production Deployment Guide

## Overview
This guide covers deploying ACAL to production with Envio indexing integration for optimal performance and user experience.

## Architecture
- **Frontend**: Next.js deployed on Vercel
- **Indexer**: Envio HyperIndex deployed on cloud infrastructure (Heroku/Railway/DigitalOcean)
- **Database**: PostgreSQL for Envio indexing data
- **Smart Contracts**: Already deployed on Monad Testnet

## Deployment Options

### Option 1: Vercel + Heroku (Recommended)

#### 1. Deploy Envio Indexer to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app for Envio
heroku create acal-envio-indexer

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini -a acal-envio-indexer

# Set environment variables
heroku config:set NODE_ENV=production -a acal-envio-indexer
heroku config:set ENVIO_RPC_URL=https://testnet-rpc.monad.xyz -a acal-envio-indexer

# Deploy using Docker
heroku container:push web -a acal-envio-indexer
heroku container:release web -a acal-envio-indexer
```

#### 2. Deploy Frontend to Vercel

```bash
# From packages/nextjs directory
cd packages/nextjs

# Set environment variables in Vercel
vercel env add NEXT_PUBLIC_ENVIO_PRODUCTION_URL
# Enter: https://acal-envio-indexer.herokuapp.com/v1/graphql

vercel env add ARBITRO_PRIVATE_KEY
# Enter your arbitro private key

vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
# Enter your Alchemy API key (if using)

# Deploy to production
vercel --prod
```

### Option 2: Railway + Vercel

#### 1. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Deploy Envio indexer
railway up
```

#### 2. Set Environment Variables in Railway
- `NODE_ENV`: production
- `POSTGRES_URL`: (automatically provided by Railway PostgreSQL)
- `ENVIO_RPC_URL`: https://testnet-rpc.monad.xyz

#### 3. Deploy Frontend to Vercel
Same as Option 1, but use Railway URL for `NEXT_PUBLIC_ENVIO_PRODUCTION_URL`

### Option 3: Self-hosted with Docker Compose

```bash
# On your server
git clone <your-repo>
cd scaffold-monad-foundry

# Set environment variables
export POSTGRES_PASSWORD=your_secure_password

# Deploy with docker-compose
docker-compose -f docker-compose.production.yml up -d

# Frontend deployment
cd packages/nextjs
NEXT_PUBLIC_ENVIO_PRODUCTION_URL=https://your-domain.com:8080/v1/graphql vercel --prod
```

## Environment Variables

### Required for Vercel Frontend:
```
NEXT_PUBLIC_ENVIO_PRODUCTION_URL=https://your-envio-endpoint.com/v1/graphql
ARBITRO_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key (optional)
```

### Required for Envio Indexer:
```
NODE_ENV=production
POSTGRES_URL=postgresql://user:password@host:port/database
ENVIO_RPC_URL=https://testnet-rpc.monad.xyz
```

## Health Checks & Monitoring

### Envio Indexer Health Check
```bash
curl https://your-envio-endpoint.com/healthz
```

### GraphQL Endpoint Test
```bash
curl -X POST https://your-envio-endpoint.com/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ Order(limit: 1) { id status } }"}'
```

### Frontend Health Check
The frontend includes automatic fallback mechanisms:
- If Envio indexer is unavailable, it shows an error message
- GraphQL client includes retry logic with exponential backoff
- Orders page gracefully handles indexer downtime

## Production Optimizations

### Envio Configuration
- Multiple RPC endpoints for failover
- Optimized start block (32680036) to avoid unnecessary historical data
- Event filtering to reduce database size

### Frontend Optimizations
- GraphQL queries replace direct RPC calls
- Efficient data caching with React Query
- Error boundaries for graceful failure handling
- Mobile-first responsive design

## Security Considerations

### Environment Variables
- Never commit private keys or sensitive data
- Use secure secret management (Vercel environment variables, Heroku config vars)
- Rotate keys regularly

### API Security
- CORS configured for arbitro endpoints
- Rate limiting on GraphQL queries
- Input validation on all API endpoints

### Database Security
- PostgreSQL with SSL enabled in production
- Database connection encryption
- Regular backups configured

## Cost Optimization

### Heroku
- Start with Hobby tier ($7/month) + Mini PostgreSQL ($5/month)
- Scale up based on usage

### Railway
- $5-20/month depending on usage
- Includes PostgreSQL database

### Vercel
- Free tier sufficient for frontend
- Pro tier ($20/month) if advanced features needed

## Maintenance

### Regular Tasks
1. Monitor indexer sync status
2. Check GraphQL endpoint performance
3. Update Envio CLI regularly
4. Monitor PostgreSQL database size
5. Review error logs

### Backup Strategy
- Automated PostgreSQL backups (included with cloud providers)
- Contract deployment artifacts stored in git
- Environment variables documented securely

## Troubleshooting

### Common Issues

**Indexer not syncing:**
- Check RPC endpoint connectivity
- Verify start block configuration
- Check PostgreSQL connection

**Frontend GraphQL errors:**
- Verify NEXT_PUBLIC_ENVIO_PRODUCTION_URL is correct
- Check CORS configuration
- Test GraphQL endpoint manually

**High costs:**
- Monitor database growth (consider data retention policies)
- Optimize GraphQL queries
- Use efficient indexing strategies

## Support

For deployment issues:
1. Check logs in your cloud provider dashboard
2. Test individual components (database, indexer, frontend)
3. Verify all environment variables are set correctly
4. Ensure smart contract addresses match deployment

This deployment setup provides a production-ready, scalable architecture for ACAL with proper separation of concerns and robust error handling.
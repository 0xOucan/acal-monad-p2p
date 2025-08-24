# Envio Setup and Usage Guide

This guide explains how to set up and run the Envio HyperIndex for the ACAL project.

## Overview

The Envio HyperIndex configuration is set up to index events from the AcalEscrow contract starting from block 32680036 on Monad Testnet. This replaces direct RPC calls with efficient GraphQL queries.

## Quick Start

### 1. Start the Envio indexer

```bash
# Install dependencies
yarn install

# Generate types and start the indexer
yarn envio:codegen --config envio.yaml
yarn envio:dev --config envio.yaml
```

The indexer will start at `http://localhost:8080` with a GraphQL endpoint at `http://localhost:8080/v1/graphql`.

### 2. Start the frontend with GraphQL integration

```bash
# Start the frontend (in another terminal)
yarn dev:full
```

The frontend now uses GraphQL queries instead of direct RPC calls, significantly reducing errors and improving performance.

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Envio GraphQL endpoint
NEXT_PUBLIC_ENVIO_ENDPOINT=http://localhost:8080/v1/graphql
```

## GraphQL Schema

The indexer creates the following entities:

### Order
- `id`: Order ID
- `maker`: Maker address
- `taker`: Taker address (nullable)
- `crHash`: CR hash
- `hashQR`: QR hash
- `mxn`: MXN amount
- `mon`: MON amount
- `expiry`: Expiry timestamp
- `status`: Order status (OPEN, LOCKED, COMPLETED, CANCELLED, DISPUTED, EXPIRED)
- Timestamps for creation, locking, completion, etc.
- Transaction hashes for each event

### OrderEvent
- Event history for each order
- Transaction details
- Gas usage information

### GlobalStats
- `totalOrders`: Total number of orders
- `openOrders`: Currently open orders
- `lockedOrders`: Locked orders
- `completedOrders`: Completed orders
- Volume statistics in MXN and MON

## Available Commands

```bash
# Code generation and indexer management
yarn envio:codegen    # Generate TypeScript types
yarn envio:dev        # Start indexer in development mode  
yarn envio:start      # Start indexer in production mode
yarn envio:test       # Run indexer tests

# Full development stack
yarn dev:full         # Frontend + Arbitro Server
yarn dev:monad        # Local Chain + Frontend + Arbitro Server + Envio
```

## GraphQL Queries

Example queries available:

```graphql
# Get all orders
query GetAllOrders {
  orders(orderBy: createdAt, orderDirection: desc) {
    id
    maker
    taker
    mxn
    mon
    status
    createdAt
  }
}

# Get global statistics
query GetGlobalStats {
  globalStats(id: "global") {
    totalOrders
    openOrders
    completedOrders
    totalVolumeMXN
    totalVolumeMON
  }
}

# Get orders by status
query GetOpenOrders {
  orders(where: { status: OPEN }) {
    id
    maker
    mxn
    mon
    expiry
  }
}
```

## Architecture Benefits

1. **Performance**: GraphQL queries are much faster than individual RPC calls
2. **Reliability**: Reduces RPC rate limits and connection issues
3. **Real-time**: Automatic indexing of new events
4. **Scalability**: Can handle many orders without performance degradation
5. **Rich Queries**: Complex filtering and sorting capabilities
6. **Statistics**: Built-in aggregation and analytics

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 8080 is in use, modify the port in envio.yaml
2. **Database errors**: Ensure PostgreSQL is running (Docker will handle this)
3. **Block sync issues**: Check the start_block in envio.yaml (currently set to 32680036)

### Logs and Monitoring

The indexer provides detailed logs about:
- Block synchronization progress
- Event processing
- Database operations
- GraphQL query performance

### Testing

```bash
# Test the GraphQL endpoint
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ globalStats(id: \"global\") { totalOrders } }"}'
```

## Production Deployment

For production, consider:
1. Using a dedicated PostgreSQL database
2. Setting up proper environment variables
3. Configuring appropriate resource limits
4. Setting up monitoring and alerting
5. Using the Envio hosted service for better reliability
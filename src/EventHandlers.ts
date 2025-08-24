// @ts-ignore
import * as HandlersJS from "../generated/src/Handlers.res.js";
// @ts-ignore
const { AcalEscrow } = HandlersJS;

import {
  Order_t,
  OrderEvent_t,
  GlobalStats_t,
} from "../generated/src/db/Entities.gen.js";

import {
  OrderStatus_t,
  OrderEventType_t,
} from "../generated/src/db/Enums.gen.js";

// Helper function to get or create global stats
const getOrCreateGlobalStats = async (context: any): Promise<GlobalStats_t> => {
  let stats = await context.GlobalStats.get("global");
  if (!stats) {
    stats = {
      id: "global",
      totalOrders: 0n,
      openOrders: 0n,
      lockedOrders: 0n,
      completedOrders: 0n,
      cancelledOrders: 0n,
      disputedOrders: 0n,
      totalVolumeMXN: 0n,
      totalVolumeMON: 0n,
      lastUpdated: BigInt(Math.floor(Date.now() / 1000)),
    };
  }
  return stats;
};

// Helper function to check if order is expired
const isOrderExpired = (expiry: bigint): boolean => {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  return currentTime > expiry;
};

AcalEscrow.OrderCreated.handler(async ({ event, context }: any) => {
  const { id, maker, mxn, mon, expiry } = event.params;
  
  // Create new order
  const order: Order_t = {
    id: id.toString(),
    maker: maker.toLowerCase(),
    taker: undefined,
    crHash: null, // Not available in current event
    hashQR: null, // Not available in current event
    mxn: mxn,
    mon: mon,
    expiry: expiry,
    status: (isOrderExpired(expiry) ? "EXPIRED" : "OPEN") as OrderStatus_t,
    createdAt: BigInt(event.block.timestamp),
    lockedAt: undefined,
    completedAt: undefined,
    cancelledAt: undefined,
    disputedAt: undefined,
    creationTxHash: event.transaction.hash,
    lockTxHash: undefined,
    completionTxHash: undefined,
    cancellationTxHash: undefined,
    disputeTxHash: undefined,
  };

  // Create order event
  const orderEvent: OrderEvent_t = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    orderId: id,
    eventType: "CREATED" as OrderEventType_t,
    maker: maker.toLowerCase(),
    taker: undefined,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
    gasUsed: BigInt(event.transaction.gasUsed || 0),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };

  // Update global stats
  const stats = await getOrCreateGlobalStats(context);
  const newStats: GlobalStats_t = {
    ...stats,
    totalOrders: stats.totalOrders + 1n,
    openOrders: order.status === "OPEN" ? stats.openOrders + 1n : stats.openOrders,
    totalVolumeMXN: stats.totalVolumeMXN + mxn,
    totalVolumeMON: stats.totalVolumeMON + mon,
    lastUpdated: BigInt(event.block.timestamp),
  };

  // Save entities
  context.Order.set(order);
  context.OrderEvent.set(orderEvent);
  context.GlobalStats.set(newStats);
});

AcalEscrow.OrderLocked.handler(async ({ event, context }: any) => {
  const { id, taker, value } = event.params;
  
  // Update existing order
  const order = await context.Order.get(id.toString());
  if (order) {
    const updatedOrder: Order_t = {
      ...order,
      taker: taker.toLowerCase(),
      status: "LOCKED" as OrderStatus_t,
      lockedAt: BigInt(event.block.timestamp),
      lockTxHash: event.transaction.hash,
    };

    // Create order event
    const orderEvent: OrderEvent_t = {
      id: `${event.transaction.hash}-${event.logIndex}`,
      orderId: id,
      eventType: "LOCKED" as OrderEventType_t,
      maker: order.maker,
      taker: taker.toLowerCase(),
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
      gasUsed: BigInt(event.transaction.gasUsed || 0),
      gasPrice: BigInt(event.transaction.gasPrice || 0),
    };

    // Update global stats
    const stats = await getOrCreateGlobalStats(context);
    const newStats: GlobalStats_t = {
      ...stats,
      openOrders: stats.openOrders - 1n,
      lockedOrders: stats.lockedOrders + 1n,
      lastUpdated: BigInt(event.block.timestamp),
    };

    // Save entities
    context.Order.set(updatedOrder);
    context.OrderEvent.set(orderEvent);
    context.GlobalStats.set(newStats);
  }
});

AcalEscrow.OrderCompleted.handler(async ({ event, context }: any) => {
  const { id } = event.params;
  
  // Update existing order
  const order = await context.Order.get(id.toString());
  if (order) {
    const updatedOrder: Order_t = {
      ...order,
      status: "COMPLETED" as OrderStatus_t,
      completedAt: BigInt(event.block.timestamp),
      completionTxHash: event.transaction.hash,
    };

    // Create order event
    const orderEvent: OrderEvent_t = {
      id: `${event.transaction.hash}-${event.logIndex}`,
      orderId: id,
      eventType: "COMPLETED" as OrderEventType_t,
      maker: order.maker,
      taker: order.taker,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
      gasUsed: BigInt(event.transaction.gasUsed || 0),
      gasPrice: BigInt(event.transaction.gasPrice || 0),
    };

    // Update global stats
    const stats = await getOrCreateGlobalStats(context);
    const newStats: GlobalStats_t = {
      ...stats,
      lockedOrders: stats.lockedOrders - 1n,
      completedOrders: stats.completedOrders + 1n,
      lastUpdated: BigInt(event.block.timestamp),
    };

    // Save entities
    context.Order.set(updatedOrder);
    context.OrderEvent.set(orderEvent);
    context.GlobalStats.set(newStats);
  }
});


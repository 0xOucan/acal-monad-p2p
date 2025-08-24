import {
  AcalEscrow_OrderCreated_handler,
  AcalEscrow_OrderLocked_handler,
  AcalEscrow_OrderCompleted_handler,
  AcalEscrow_OrderCancelled_handler,
  AcalEscrow_OrderDisputed_handler,
} from "../generated/src/Handlers.gen";

import {
  Order,
  OrderEvent,
  GlobalStats,
  OrderStatus,
  OrderEventType,
} from "../generated/src/Types.gen";

// Helper function to get or create global stats
const getOrCreateGlobalStats = async (context: any): Promise<GlobalStats> => {
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

AcalEscrow_OrderCreated_handler(async ({ event, context }) => {
  const { orderId, maker, crHash, hashQR, mxn, mon, expiry } = event.params;
  
  // Create new order
  const order: Order = {
    id: orderId.toString(),
    maker: maker.toLowerCase(),
    taker: null,
    crHash: crHash,
    hashQR: hashQR,
    mxn: mxn,
    mon: mon,
    expiry: expiry,
    status: isOrderExpired(expiry) ? OrderStatus.EXPIRED : OrderStatus.OPEN,
    createdAt: BigInt(event.blockTimestamp),
    lockedAt: null,
    completedAt: null,
    cancelledAt: null,
    disputedAt: null,
    creationTxHash: event.transactionHash,
    lockTxHash: null,
    completionTxHash: null,
    cancellationTxHash: null,
    disputeTxHash: null,
  };

  // Create order event
  const orderEvent: OrderEvent = {
    id: `${event.transactionHash}-${event.logIndex}`,
    orderId: orderId,
    eventType: OrderEventType.CREATED,
    maker: maker.toLowerCase(),
    taker: null,
    blockNumber: BigInt(event.blockNumber),
    blockTimestamp: BigInt(event.blockTimestamp),
    transactionHash: event.transactionHash,
    gasUsed: BigInt(event.transaction.gasUsed || 0),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };

  // Update global stats
  const stats = await getOrCreateGlobalStats(context);
  stats.totalOrders += 1n;
  if (order.status === OrderStatus.OPEN) {
    stats.openOrders += 1n;
  }
  stats.totalVolumeMXN += mxn;
  stats.totalVolumeMON += mon;
  stats.lastUpdated = BigInt(event.blockTimestamp);

  // Save entities
  context.Order.set(order);
  context.OrderEvent.set(orderEvent);
  context.GlobalStats.set(stats);
});

AcalEscrow_OrderLocked_handler(async ({ event, context }) => {
  const { orderId, taker } = event.params;
  
  // Update existing order
  const order = await context.Order.get(orderId.toString());
  if (order) {
    order.taker = taker.toLowerCase();
    order.status = OrderStatus.LOCKED;
    order.lockedAt = BigInt(event.blockTimestamp);
    order.lockTxHash = event.transactionHash;

    // Create order event
    const orderEvent: OrderEvent = {
      id: `${event.transactionHash}-${event.logIndex}`,
      orderId: orderId,
      eventType: OrderEventType.LOCKED,
      maker: order.maker,
      taker: taker.toLowerCase(),
      blockNumber: BigInt(event.blockNumber),
      blockTimestamp: BigInt(event.blockTimestamp),
      transactionHash: event.transactionHash,
      gasUsed: BigInt(event.transaction.gasUsed || 0),
      gasPrice: BigInt(event.transaction.gasPrice || 0),
    };

    // Update global stats
    const stats = await getOrCreateGlobalStats(context);
    stats.openOrders -= 1n;
    stats.lockedOrders += 1n;
    stats.lastUpdated = BigInt(event.blockTimestamp);

    // Save entities
    context.Order.set(order);
    context.OrderEvent.set(orderEvent);
    context.GlobalStats.set(stats);
  }
});

AcalEscrow_OrderCompleted_handler(async ({ event, context }) => {
  const { orderId } = event.params;
  
  // Update existing order
  const order = await context.Order.get(orderId.toString());
  if (order) {
    order.status = OrderStatus.COMPLETED;
    order.completedAt = BigInt(event.blockTimestamp);
    order.completionTxHash = event.transactionHash;

    // Create order event
    const orderEvent: OrderEvent = {
      id: `${event.transactionHash}-${event.logIndex}`,
      orderId: orderId,
      eventType: OrderEventType.COMPLETED,
      maker: order.maker,
      taker: order.taker,
      blockNumber: BigInt(event.blockNumber),
      blockTimestamp: BigInt(event.blockTimestamp),
      transactionHash: event.transactionHash,
      gasUsed: BigInt(event.transaction.gasUsed || 0),
      gasPrice: BigInt(event.transaction.gasPrice || 0),
    };

    // Update global stats
    const stats = await getOrCreateGlobalStats(context);
    stats.lockedOrders -= 1n;
    stats.completedOrders += 1n;
    stats.lastUpdated = BigInt(event.blockTimestamp);

    // Save entities
    context.Order.set(order);
    context.OrderEvent.set(orderEvent);
    context.GlobalStats.set(stats);
  }
});

AcalEscrow_OrderCancelled_handler(async ({ event, context }) => {
  const { orderId } = event.params;
  
  // Update existing order
  const order = await context.Order.get(orderId.toString());
  if (order) {
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = BigInt(event.blockTimestamp);
    order.cancellationTxHash = event.transactionHash;

    // Create order event
    const orderEvent: OrderEvent = {
      id: `${event.transactionHash}-${event.logIndex}`,
      orderId: orderId,
      eventType: OrderEventType.CANCELLED,
      maker: order.maker,
      taker: order.taker,
      blockNumber: BigInt(event.blockNumber),
      blockTimestamp: BigInt(event.blockTimestamp),
      transactionHash: event.transactionHash,
      gasUsed: BigInt(event.transaction.gasUsed || 0),
      gasPrice: BigInt(event.transaction.gasPrice || 0),
    };

    // Update global stats
    const stats = await getOrCreateGlobalStats(context);
    if (order.status === OrderStatus.OPEN) {
      stats.openOrders -= 1n;
    } else if (order.status === OrderStatus.LOCKED) {
      stats.lockedOrders -= 1n;
    }
    stats.cancelledOrders += 1n;
    stats.lastUpdated = BigInt(event.blockTimestamp);

    // Save entities
    context.Order.set(order);
    context.OrderEvent.set(orderEvent);
    context.GlobalStats.set(stats);
  }
});

AcalEscrow_OrderDisputed_handler(async ({ event, context }) => {
  const { orderId } = event.params;
  
  // Update existing order
  const order = await context.Order.get(orderId.toString());
  if (order) {
    order.status = OrderStatus.DISPUTED;
    order.disputedAt = BigInt(event.blockTimestamp);
    order.disputeTxHash = event.transactionHash;

    // Create order event
    const orderEvent: OrderEvent = {
      id: `${event.transactionHash}-${event.logIndex}`,
      orderId: orderId,
      eventType: OrderEventType.DISPUTED,
      maker: order.maker,
      taker: order.taker,
      blockNumber: BigInt(event.blockNumber),
      blockTimestamp: BigInt(event.blockTimestamp),
      transactionHash: event.transactionHash,
      gasUsed: BigInt(event.transaction.gasUsed || 0),
      gasPrice: BigInt(event.transaction.gasPrice || 0),
    };

    // Update global stats
    const stats = await getOrCreateGlobalStats(context);
    if (order.status === OrderStatus.LOCKED) {
      stats.lockedOrders -= 1n;
    }
    stats.disputedOrders += 1n;
    stats.lastUpdated = BigInt(event.blockTimestamp);

    // Save entities
    context.Order.set(order);
    context.OrderEvent.set(orderEvent);
    context.GlobalStats.set(stats);
  }
});
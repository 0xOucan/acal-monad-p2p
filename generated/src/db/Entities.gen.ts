/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {OrderEventType_t as Enums_OrderEventType_t} from './Enums.gen';

import type {OrderStatus_t as Enums_OrderStatus_t} from './Enums.gen';

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type GlobalStats_t = {
  readonly cancelledOrders: bigint; 
  readonly completedOrders: bigint; 
  readonly disputedOrders: bigint; 
  readonly id: id; 
  readonly lastUpdated: bigint; 
  readonly lockedOrders: bigint; 
  readonly openOrders: bigint; 
  readonly totalOrders: bigint; 
  readonly totalVolumeMON: bigint; 
  readonly totalVolumeMXN: bigint
};

export type GlobalStats_indexedFieldOperations = {};

export type Order_t = {
  readonly cancellationTxHash: (undefined | string); 
  readonly cancelledAt: (undefined | bigint); 
  readonly completedAt: (undefined | bigint); 
  readonly completionTxHash: (undefined | string); 
  readonly crHash: string; 
  readonly createdAt: bigint; 
  readonly creationTxHash: string; 
  readonly disputeTxHash: (undefined | string); 
  readonly disputedAt: (undefined | bigint); 
  readonly expiry: bigint; 
  readonly hashQR: string; 
  readonly id: id; 
  readonly lockTxHash: (undefined | string); 
  readonly lockedAt: (undefined | bigint); 
  readonly maker: string; 
  readonly mon: bigint; 
  readonly mxn: bigint; 
  readonly status: Enums_OrderStatus_t; 
  readonly taker: (undefined | string)
};

export type Order_indexedFieldOperations = {};

export type OrderEvent_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly eventType: Enums_OrderEventType_t; 
  readonly gasPrice: bigint; 
  readonly gasUsed: bigint; 
  readonly id: id; 
  readonly maker: (undefined | string); 
  readonly orderId: bigint; 
  readonly taker: (undefined | string); 
  readonly transactionHash: string
};

export type OrderEvent_indexedFieldOperations = {};

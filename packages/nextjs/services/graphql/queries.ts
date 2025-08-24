import { gql } from "graphql-request";

// Types matching our GraphQL schema
export interface Order {
  id: string;
  maker: string;
  taker?: string;
  crHash: string;
  hashQR: string;
  mxn: string; // BigInt as string
  mon: string; // BigInt as string
  expiry: string; // BigInt as string
  status: "OPEN" | "LOCKED" | "COMPLETED" | "CANCELLED" | "DISPUTED" | "EXPIRED";
  createdAt: string;
  lockedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  disputedAt?: string;
  creationTxHash: string;
  lockTxHash?: string;
  completionTxHash?: string;
  cancellationTxHash?: string;
  disputeTxHash?: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  eventType: "CREATED" | "LOCKED" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  maker?: string;
  taker?: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  gasUsed: string;
  gasPrice: string;
}

export interface GlobalStats {
  id: string;
  totalOrders: string;
  openOrders: string;
  lockedOrders: string;
  completedOrders: string;
  cancelledOrders: string;
  disputedOrders: string;
  totalVolumeMXN: string;
  totalVolumeMON: string;
  lastUpdated: string;
}

// GraphQL Queries
export const GET_ALL_ORDERS = gql`
  query GetAllOrders($first: Int = 100) {
    Order(limit: $first) {
      id
      maker
      taker
      crHash
      hashQR
      mxn
      mon
      expiry
      status
      createdAt
      lockedAt
      completedAt
      cancelledAt
      disputedAt
      creationTxHash
      lockTxHash
      completionTxHash
      cancellationTxHash
      disputeTxHash
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: ID!) {
    order(id: $id) {
      id
      maker
      taker
      crHash
      hashQR
      mxn
      mon
      expiry
      status
      createdAt
      lockedAt
      completedAt
      cancelledAt
      disputedAt
      creationTxHash
      lockTxHash
      completionTxHash
      cancellationTxHash
      disputeTxHash
    }
  }
`;

export const GET_ORDERS_BY_STATUS = gql`
  query GetOrdersByStatus($status: OrderStatus!, $first: Int = 100) {
    Order(where: { status: { _eq: $status } }, limit: $first, order_by: { createdAt: desc }) {
      id
      maker
      taker
      crHash
      hashQR
      mxn
      mon
      expiry
      status
      createdAt
      lockedAt
      completedAt
      cancelledAt
      disputedAt
      creationTxHash
    }
  }
`;

export const GET_ORDERS_BY_MAKER = gql`
  query GetOrdersByMaker($maker: String!, $first: Int = 100) {
    Order(where: { maker: { _eq: $maker } }, limit: $first, order_by: { createdAt: desc }) {
      id
      maker
      taker
      crHash
      hashQR
      mxn
      mon
      expiry
      status
      createdAt
      lockedAt
      completedAt
      cancelledAt
      disputedAt
      creationTxHash
    }
  }
`;

export const GET_ORDERS_BY_TAKER = gql`
  query GetOrdersByTaker($taker: String!, $first: Int = 100) {
    Order(where: { taker: { _eq: $taker } }, limit: $first, order_by: { createdAt: desc }) {
      id
      maker
      taker
      crHash
      hashQR
      mxn
      mon
      expiry
      status
      createdAt
      lockedAt
      completedAt
      cancelledAt
      disputedAt
      lockTxHash
      completionTxHash
      cancellationTxHash
      disputeTxHash
    }
  }
`;

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    GlobalStats(where: { id: { _eq: "global" } }) {
      id
      totalOrders
      openOrders
      lockedOrders
      completedOrders
      cancelledOrders
      disputedOrders
      totalVolumeMXN
      totalVolumeMON
      lastUpdated
    }
  }
`;

export const GET_ORDER_EVENTS = gql`
  query GetOrderEvents($orderId: BigInt!, $first: Int = 50) {
    OrderEvent(where: { orderId: { _eq: $orderId } }, limit: $first, order_by: { blockTimestamp: desc }) {
      id
      orderId
      eventType
      maker
      taker
      blockNumber
      blockTimestamp
      transactionHash
      gasUsed
      gasPrice
    }
  }
`;

export const GET_RECENT_ORDERS = gql`
  query GetRecentOrders($first: Int = 10) {
    Order(limit: $first, order_by: { createdAt: desc }) {
      id
      maker
      taker
      mxn
      mon
      status
      createdAt
      creationTxHash
    }
  }
`;

// Response types
export interface GetAllOrdersResponse {
  orders?: Order[];
  Order?: Order[];
}

export interface GetOrderByIdResponse {
  order: Order | null;
}

export interface GetOrdersByStatusResponse {
  Order: Order[];
}

export interface GetOrdersByMakerResponse {
  Order: Order[];
}

export interface GetOrdersByTakerResponse {
  Order: Order[];
}

export interface GetGlobalStatsResponse {
  GlobalStats: GlobalStats[];
}

export interface GetOrderEventsResponse {
  OrderEvent: OrderEvent[];
}

export interface GetRecentOrdersResponse {
  Order: Order[];
}

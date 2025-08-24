"use client";

import { useEffect, useState } from "react";
import { executeGraphQLQuery } from "~~/services/graphql/client";
import {
  GET_ALL_ORDERS,
  GET_GLOBAL_STATS,
  GET_ORDERS_BY_MAKER,
  GET_ORDERS_BY_STATUS,
  GET_ORDERS_BY_TAKER,
  GET_ORDER_BY_ID,
  type GetAllOrdersResponse,
  type GetGlobalStatsResponse,
  type GetOrderByIdResponse,
  type GetOrdersByMakerResponse,
  type GetOrdersByStatusResponse,
  type GetOrdersByTakerResponse,
  type GlobalStats,
  type Order,
} from "~~/services/graphql/queries";

// Convert GraphQL Order to frontend Order format
export interface FrontendOrder {
  id: string;
  maker: string;
  taker?: string;
  cr: string;
  hashQR: string;
  mxn: bigint;
  mon: bigint;
  expiry: bigint;
  status: number;
  makerBond: bigint; // Default value since not tracked in events
  takerBond: bigint; // Default value since not tracked in events
  createdAt: bigint;
  lockedAt?: bigint;
  completedAt?: bigint;
  cancelledAt?: bigint;
  disputedAt?: bigint;
}

// Order status mapping from GraphQL enum to numbers
const STATUS_MAP = {
  OPEN: 0,
  LOCKED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  DISPUTED: 4,
  EXPIRED: 5,
} as const;

// Convert GraphQL order to frontend format
function convertOrder(order: Order): FrontendOrder {
  return {
    id: order.id,
    maker: order.maker,
    taker: order.taker || undefined,
    cr: order.crHash,
    hashQR: order.hashQR,
    mxn: BigInt(order.mxn),
    mon: BigInt(order.mon),
    expiry: BigInt(order.expiry),
    status: STATUS_MAP[order.status],
    makerBond: BigInt("50000000000000000"), // 0.05 ETH default
    takerBond: BigInt("50000000000000000"), // 0.05 ETH default
    createdAt: BigInt(order.createdAt),
    lockedAt: order.lockedAt ? BigInt(order.lockedAt) : undefined,
    completedAt: order.completedAt ? BigInt(order.completedAt) : undefined,
    cancelledAt: order.cancelledAt ? BigInt(order.cancelledAt) : undefined,
    disputedAt: order.disputedAt ? BigInt(order.disputedAt) : undefined,
  };
}

// Hook to get all orders
export function useAllOrders(limit = 100) {
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeGraphQLQuery<GetAllOrdersResponse>(GET_ALL_ORDERS, { first: limit });

        const convertedOrders = response.orders.map(convertOrder);
        setOrders(convertedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
        setOrders([]); // Set empty array on error to prevent crashes
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [limit]);

  return {
    orders,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-trigger useEffect
    },
  };
}

// Hook to get a single order by ID
export function useOrder(orderId: string | number) {
  const [order, setOrder] = useState<FrontendOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeGraphQLQuery<GetOrderByIdResponse>(GET_ORDER_BY_ID, { id: orderId.toString() });

        if (response.order) {
          setOrder(convertOrder(response.order));
        } else {
          setOrder(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch order");
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId !== undefined && orderId !== null) {
      fetchOrder();
    }
  }, [orderId]);

  return {
    order,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
    },
  };
}

// Hook to get orders by status
export function useOrdersByStatus(status: keyof typeof STATUS_MAP, limit = 100) {
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeGraphQLQuery<GetOrdersByStatusResponse>(GET_ORDERS_BY_STATUS, {
          status,
          first: limit,
        });

        const convertedOrders = response.orders.map(convertOrder);
        setOrders(convertedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders by status");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [status, limit]);

  return {
    orders,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
    },
  };
}

// Hook to get orders by maker
export function useOrdersByMaker(maker: string, limit = 100) {
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeGraphQLQuery<GetOrdersByMakerResponse>(GET_ORDERS_BY_MAKER, {
          maker: maker.toLowerCase(),
          first: limit,
        });

        const convertedOrders = response.orders.map(convertOrder);
        setOrders(convertedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders by maker");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (maker) {
      fetchOrders();
    }
  }, [maker, limit]);

  return {
    orders,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
    },
  };
}

// Hook to get orders by taker
export function useOrdersByTaker(taker: string, limit = 100) {
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeGraphQLQuery<GetOrdersByTakerResponse>(GET_ORDERS_BY_TAKER, {
          taker: taker.toLowerCase(),
          first: limit,
        });

        const convertedOrders = response.orders.map(convertOrder);
        setOrders(convertedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders by taker");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (taker) {
      fetchOrders();
    }
  }, [taker, limit]);

  return {
    orders,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
    },
  };
}

// Hook to get global statistics
export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await executeGraphQLQuery<GetGlobalStatsResponse>(GET_GLOBAL_STATS);

        setStats(response.globalStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch global stats");
        // Set default stats to prevent crashes
        setStats({
          id: "global",
          totalOrders: "0",
          openOrders: "0",
          lockedOrders: "0",
          completedOrders: "0",
          cancelledOrders: "0",
          disputedOrders: "0",
          totalVolumeMXN: "0",
          totalVolumeMON: "0",
          lastUpdated: "0",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
    },
  };
}

// Compatibility exports for existing components
export const ORDER_STATUS = {
  OPEN: 0,
  LOCKED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  DISPUTED: 4,
  EXPIRED: 5,
} as const;

export function getOrderStatusText(status: number): string {
  switch (status) {
    case ORDER_STATUS.OPEN:
      return "Abierta";
    case ORDER_STATUS.LOCKED:
      return "Bloqueada";
    case ORDER_STATUS.COMPLETED:
      return "Completada";
    case ORDER_STATUS.CANCELLED:
      return "Cancelada";
    case ORDER_STATUS.DISPUTED:
      return "En Disputa";
    case ORDER_STATUS.EXPIRED:
      return "Expirada";
    default:
      return "Desconocido";
  }
}

// Hook to simulate nextId for backward compatibility
export function useNextOrderId() {
  const { stats, isLoading } = useGlobalStats();

  return {
    nextId: stats ? BigInt(stats.totalOrders) : undefined,
    isLoading,
  };
}

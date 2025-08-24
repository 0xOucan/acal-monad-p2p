"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export interface Order {
  maker: string;
  taker: string;
  cr: string;
  hashQR: string;
  mxn: bigint;
  mon: bigint;
  expiry: bigint;
  status: number;
  makerBond: bigint;
  takerBond: bigint;
}

export function useOrder(orderId: number) {
  const {
    data: order,
    isLoading,
    error,
  } = useScaffoldReadContract({
    contractName: "AcalEscrow",
    functionName: "orders",
    args: [BigInt(orderId)],
  });

  return {
    order: order as Order | undefined,
    isLoading,
    error,
  };
}

export function useNextOrderId() {
  const { data: nextId, isLoading } = useScaffoldReadContract({
    contractName: "AcalEscrow",
    functionName: "nextId",
  });

  return {
    nextId: nextId as bigint | undefined,
    isLoading,
  };
}

// Order status enum
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

"use client";

import { useState } from "react";
import { parseEther } from "viem";
import type { Hash } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const TAKER_BOND = parseEther("0.05"); // 0.05 MON

export interface LockOrderResult {
  txHash?: Hash;
  success: boolean;
  error?: string;
}

export function useLockOrder() {
  const [isLocking, setIsLocking] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<Hash | undefined>();

  const { writeContractAsync: writeAcalEscrow } = useScaffoldWriteContract({
    contractName: "AcalEscrow",
  });

  const lockOrder = async (orderId: number, orderMon: bigint): Promise<LockOrderResult> => {
    setIsLocking(true);
    setCurrentTxHash(undefined);

    try {
      // Total = MON amount + taker bond (0.05 MON)
      const totalPayment = orderMon + TAKER_BOND;

      console.log(`Locking order ${orderId}:`, {
        orderId,
        orderMon: orderMon.toString(),
        takerBond: TAKER_BOND.toString(),
        totalPayment: totalPayment.toString(),
      });

      // Lock order on the blockchain
      const txHash = await writeAcalEscrow({
        functionName: "lockOrder",
        args: [BigInt(orderId)],
        value: totalPayment,
      });

      setCurrentTxHash(txHash);

      return {
        txHash,
        success: true,
      };
    } catch (error: any) {
      console.error("Error locking order:", error);

      let errorMessage = "Error desconocido al bloquear la orden";

      if (error?.message) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Fondos insuficientes en tu billetera";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transacción cancelada por el usuario";
        } else if (error.message.includes("not Open")) {
          errorMessage = "Esta orden ya no está disponible";
        } else if (error.message.includes("expired")) {
          errorMessage = "Esta orden ha expirado";
        } else if (error.message.includes("need mon+takerBond")) {
          errorMessage = "Monto incorrecto - verifica el cálculo";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLocking(false);
    }
  };

  const getTakerBond = () => TAKER_BOND;
  const getTotalPayment = (orderMon: bigint) => orderMon + TAKER_BOND;

  return {
    lockOrder,
    isLocking,
    currentTxHash,
    getTakerBond,
    getTotalPayment,
  };
}

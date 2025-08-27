"use client";

import { useState } from "react";
import type { Hash } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface CompleteOrderAction {
  orderId: bigint;
  actionType: number; // 0 = COMPLETE_SUCCESS, 1 = COMPLETE_FAILURE, etc.
  evidenceHash: `0x${string}`; // bytes32 hash of evidence (e.g., QR code data)
  deadline: bigint;
}

export interface CompleteOrderResult {
  txHash?: Hash;
  success: boolean;
  error?: string;
}

export function useCompleteOrder() {
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<Hash | undefined>();

  const { writeContractAsync: writeAcalEscrow } = useScaffoldWriteContract({
    contractName: "AcalEscrow",
  });

  const completeOrder = async (
    orderId: number,
    signatures: `0x${string}`[],
    action: CompleteOrderAction,
  ): Promise<CompleteOrderResult> => {
    setIsCompleting(true);
    setCurrentTxHash(undefined);

    try {
      console.log(`Completing order ${orderId}:`, {
        orderId,
        signatures: signatures.length,
        actionType: action.actionType,
        evidenceHash: action.evidenceHash,
        deadline: action.deadline.toString(),
      });

      // Complete order on the blockchain
      const txHash = await writeAcalEscrow({
        functionName: "completeOrder",
        args: [BigInt(orderId), signatures, action],
      });

      setCurrentTxHash(txHash);

      return {
        txHash,
        success: true,
      };
    } catch (error: any) {
      console.error("Error completing order:", error);

      let errorMessage = "Error desconocido al completar la orden";

      if (error?.message) {
        if (error.message.includes("not Locked")) {
          errorMessage = "Esta orden no está bloqueada";
        } else if (error.message.includes("need 2 of 3")) {
          errorMessage = "Se requieren al menos 2 firmas de 3 partes";
        } else if (error.message.includes("wrong action")) {
          errorMessage = "Tipo de acción incorrecta";
        } else if (error.message.includes("deadline")) {
          errorMessage = "La fecha límite de la acción ha expirado";
        } else if (error.message.includes("no subsidy")) {
          errorMessage = "Fondos insuficientes en el pool de subsidios";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transacción cancelada por el usuario";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsCompleting(false);
    }
  };

  // Create a simplified complete order function for demo purposes
  const completeOrderDemo = async (orderId: number): Promise<CompleteOrderResult> => {
    const action: CompleteOrderAction = {
      orderId: BigInt(orderId),
      actionType: 0, // COMPLETE_SUCCESS
      evidenceHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      deadline: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
    };

    // For demo purposes, using empty signatures array
    // In production, this would require proper EIP-712 signatures from maker, taker, or arbitro
    const signatures: `0x${string}`[] = [];

    return await completeOrder(orderId, signatures, action);
  };

  return {
    completeOrder,
    completeOrderDemo,
    isCompleting,
    currentTxHash,
  };
}

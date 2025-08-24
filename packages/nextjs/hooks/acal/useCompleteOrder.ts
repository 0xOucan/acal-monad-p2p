"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface CompleteOrderAction {
  orderId: bigint;
  actionType: number; // 0 = COMPLETE_SUCCESS, 1 = COMPLETE_FAILURE, etc.
  evidenceHash: `0x${string}`; // bytes32 hash of evidence (e.g., QR code data)
  deadline: bigint;
}

export function useCompleteOrder() {
  const [isCompleting, setIsCompleting] = useState(false);

  const { writeContractAsync: writeAcalEscrow } = useScaffoldWriteContract({
    contractName: "AcalEscrow",
  });

  const completeOrder = async (orderId: number, signatures: `0x${string}`[], action: CompleteOrderAction) => {
    setIsCompleting(true);

    try {
      // Complete order on the blockchain
      const result = await writeAcalEscrow({
        functionName: "completeOrder",
        args: [BigInt(orderId), signatures, action],
      });

      return result;
    } catch (error) {
      console.error("Error completing order:", error);
      throw error;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    completeOrder,
    isCompleting,
  };
}

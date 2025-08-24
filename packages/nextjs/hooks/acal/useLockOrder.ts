"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const TAKER_BOND = parseEther("0.05"); // 0.05 MON

export function useLockOrder() {
  const [isLocking, setIsLocking] = useState(false);

  const { writeContractAsync: writeAcalEscrow } = useScaffoldWriteContract({
    contractName: "AcalEscrow",
  });

  const lockOrder = async (orderId: number, orderMon: bigint) => {
    setIsLocking(true);

    try {
      // Total = MON amount + taker bond (0.05 MON)
      const totalPayment = orderMon + TAKER_BOND;

      // Lock order on the blockchain
      const result = await writeAcalEscrow({
        functionName: "lockOrder",
        args: [BigInt(orderId)],
        value: totalPayment,
      });

      return result;
    } catch (error) {
      console.error("Error locking order:", error);
      throw error;
    } finally {
      setIsLocking(false);
    }
  };

  return {
    lockOrder,
    isLocking,
  };
}

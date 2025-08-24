"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ParsedSpinQR } from "~~/utils/spinQR";

export function useCreateOrder() {
  const [isCreating, setIsCreating] = useState(false);

  const { writeContractAsync: writeAcalEscrow } = useScaffoldWriteContract("AcalEscrow");

  const createOrder = async (qrData: ParsedSpinQR) => {
    if (!qrData) throw new Error("QR data is required");

    setIsCreating(true);

    try {
      // Calculate expiry timestamp (7 days from now or QR expiry, whichever is earlier)
      const maxExpiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
      const qrExpiry = Math.floor(qrData.expiry.getTime() / 1000);
      const expiry = Math.min(maxExpiry, qrExpiry);

      // Create order on the blockchain
      const result = await writeAcalEscrow({
        functionName: "createOrder",
        args: [
          qrData.crHash, // bytes32 crHash
          qrData.qrHash, // bytes32 hashQR
          BigInt(qrData.amount), // uint256 mxn
          BigInt(expiry), // uint256 expiry
        ],
      });

      return result;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createOrder,
    isCreating,
  };
}

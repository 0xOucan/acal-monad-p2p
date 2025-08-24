"use client";

import { useState } from "react";
import { useSponsorPoolBalance } from "./useSponsorPool";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ParsedSpinQR } from "~~/utils/spinQR";

const MAKER_BOND = parseEther("0.05"); // 0.05 MON required in SponsorPool

export function useCreateOrder() {
  const [isCreating, setIsCreating] = useState(false);
  const { balance: sponsorPoolBalance } = useSponsorPoolBalance();

  const { writeContractAsync: writeAcalEscrow } = useScaffoldWriteContract({
    contractName: "AcalEscrow",
  });

  const createOrder = async (qrData: ParsedSpinQR) => {
    if (!qrData) throw new Error("QR data is required");

    // Check if SponsorPool has enough balance for the maker bond
    if (!sponsorPoolBalance || sponsorPoolBalance < MAKER_BOND) {
      throw new Error(
        `SponsorPool insufficient funds. Required: 0.05 MON, Available: ${
          sponsorPoolBalance ? Number(sponsorPoolBalance) / 1e18 : "0"
        } MON. The SponsorPool needs to be funded by ACAL sponsors.`,
      );
    }

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

      // Provide more specific error messages
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as Error).message;

        if (errorMessage.includes("transfer failed")) {
          throw new Error(
            "SponsorPool transfer failed. The SponsorPool may not have sufficient funds (0.05 MON required) or there's a contract configuration issue. Please contact ACAL support.",
          );
        }

        if (errorMessage.includes("CR used")) {
          throw new Error("This OXXO payment code has already been used. Please generate a new QR code.");
        }

        if (errorMessage.includes("mxn range")) {
          throw new Error("Amount must be between 100 and 500 MXN.");
        }

        if (errorMessage.includes("expiry>7d")) {
          throw new Error("QR code expiry cannot be more than 7 days from now.");
        }
      }

      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createOrder,
    isCreating,
    sponsorPoolBalance,
    requiredMakerBond: MAKER_BOND,
  };
}

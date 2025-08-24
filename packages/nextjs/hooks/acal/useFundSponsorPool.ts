"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function useFundSponsorPool() {
  const [isFunding, setIsFunding] = useState(false);

  const { writeContractAsync: writeSponsorPool } = useScaffoldWriteContract({
    contractName: "SponsorPool",
  });

  const fundSponsorPool = async (amountInMON: number) => {
    setIsFunding(true);

    try {
      const result = await writeSponsorPool({
        functionName: "deposit",
        value: parseEther(amountInMON.toString()),
      });

      return result;
    } catch (error) {
      console.error("Error funding SponsorPool:", error);
      throw error;
    } finally {
      setIsFunding(false);
    }
  };

  return {
    fundSponsorPool,
    isFunding,
  };
}

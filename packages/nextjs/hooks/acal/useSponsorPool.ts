"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function useSponsorPoolBalance() {
  const {
    data: balance,
    isLoading,
    error,
  } = useScaffoldReadContract({
    contractName: "SponsorPool",
    functionName: "balance",
  });

  return {
    balance: balance as bigint | undefined,
    isLoading,
    error,
  };
}

export function useSponsorPoolInfo() {
  const { data: escrowAddress } = useScaffoldReadContract({
    contractName: "SponsorPool",
    functionName: "escrow",
  });

  const { balance, isLoading, error } = useSponsorPoolBalance();

  return {
    escrowAddress,
    balance,
    isLoading,
    error,
  };
}

"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useFundSponsorPool } from "~~/hooks/acal/useFundSponsorPool";
import { useSponsorPoolBalance } from "~~/hooks/acal/useSponsorPool";

export function SponsorPoolDebug() {
  const [fundAmount, setFundAmount] = useState(0.5);
  const { balance, isLoading } = useSponsorPoolBalance();
  const { fundSponsorPool, isFunding } = useFundSponsorPool();

  const handleFund = async () => {
    try {
      await fundSponsorPool(fundAmount);
      alert(`Successfully funded SponsorPool with ${fundAmount} MON!`);
    } catch (error) {
      console.error("Funding error:", error);
      alert(`Failed to fund SponsorPool: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const isInsufficientFunds = balance && balance < BigInt("50000000000000000"); // 0.05 MON

  return (
    <div className="acal-card rounded-xl p-4 mb-4">
      <h3 className="text-lg font-bold text-[#FFD700] mb-3">🏦 SponsorPool Status</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Balance:</span>
          <span className={`font-bold ${isInsufficientFunds ? "text-red-400" : "text-[#40E0D0]"}`}>
            {isLoading ? "Loading..." : balance ? `${formatEther(balance)} MON` : "0 MON"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Required per order:</span>
          <span className="font-bold text-yellow-400">0.05 MON</span>
        </div>

        {isInsufficientFunds && (
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <div className="text-red-400 text-sm font-medium mb-2">⚠️ Insufficient SponsorPool Funds</div>
            <div className="text-xs text-red-300">
              Order creation will fail until the pool is funded with at least 0.05 MON
            </div>
          </div>
        )}

        <div className="border-t border-gray-600 pt-3">
          <div className="text-sm text-gray-400 mb-2">Development Funding:</div>
          <div className="flex space-x-2">
            <input
              type="number"
              value={fundAmount}
              onChange={e => setFundAmount(parseFloat(e.target.value) || 0)}
              step={0.1}
              min={0.05}
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm text-white"
              placeholder="Amount in MON"
            />
            <button
              onClick={handleFund}
              disabled={isFunding || fundAmount <= 0}
              className="bg-[#FFD700] hover:bg-[#FFD700]/80 disabled:bg-gray-600 text-black font-bold px-4 py-2 rounded transition-colors text-sm"
            >
              {isFunding ? "Funding..." : "Fund"}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">This funds the SponsorPool to enable order creation</div>
        </div>
      </div>
    </div>
  );
}

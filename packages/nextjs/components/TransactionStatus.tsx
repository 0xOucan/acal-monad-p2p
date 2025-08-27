"use client";

import { useEffect } from "react";
import type { Hash } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

export type TransactionStep = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "failed";
};

interface TransactionStatusProps {
  txHash?: Hash;
  steps: TransactionStep[];
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ txHash, steps, onClose, onSuccess, onError }) => {
  const {
    data: receipt,
    error: receiptError,
    isLoading: isWaiting,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (receipt && receipt.status === "success") {
      // Transaction successful
      onSuccess?.();
    } else if (receiptError) {
      // Transaction failed
      onError?.(receiptError.message);
    }
  }, [receipt, receiptError, onSuccess, onError]);

  const getStepIcon = (step: TransactionStep) => {
    if (step.status === "completed") return "✅";
    if (step.status === "failed") return "❌";
    if (step.status === "active") return "⏳";
    return "⚪";
  };

  const getStepColor = (step: TransactionStep) => {
    switch (step.status) {
      case "completed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "active":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-[#40E0D0]/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#FFD700]">🛶 Procesando Orden</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" disabled={isWaiting}>
            ✕
          </button>
        </div>

        {/* Transaction Hash */}
        {txHash && (
          <div className="mb-6 p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Hash de Transacción:</div>
            <div className="text-xs font-mono break-all text-[#40E0D0]">{txHash}</div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {steps.map(step => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="text-2xl mt-1">{getStepIcon(step)}</div>
              <div className="flex-1">
                <div className={`font-semibold ${getStepColor(step)}`}>{step.title}</div>
                <div className="text-sm text-gray-400 mt-1">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Animation */}
        {isWaiting && (
          <div className="flex items-center justify-center space-x-2 text-[#40E0D0]">
            <div className="animate-spin text-xl">🛶</div>
            <span>Esperando confirmación...</span>
          </div>
        )}

        {/* Error Message */}
        {receiptError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-red-400 text-sm">
              <strong>Error:</strong> {receiptError.message}
            </div>
          </div>
        )}

        {/* Success Actions */}
        {receipt && receipt.status === "success" && (
          <div className="flex space-x-3">
            <button
              onClick={() => window.open(`https://testnet.monadexplorer.com/tx/${txHash}`, "_blank")}
              className="flex-1 bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Ver en Explorer
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#FFD700] hover:bg-[#FFD700]/80 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

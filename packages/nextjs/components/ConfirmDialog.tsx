"use client";

import { formatEther } from "viem";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  orderData?: {
    orderId: string;
    maker: string;
    mxn: bigint;
    mon: bigint;
    takerBond: bigint;
  };
  isLoading?: boolean;
  action: "lock" | "claim" | "cancel" | "dispute";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  orderData,
  isLoading = false,
  action,
}) => {
  if (!isOpen) return null;

  const getActionIcon = () => {
    switch (action) {
      case "lock":
        return "⛵";
      case "claim":
        return "🏆";
      case "cancel":
        return "❌";
      case "dispute":
        return "⚠️";
      default:
        return "🛶";
    }
  };

  const getActionColor = () => {
    switch (action) {
      case "lock":
        return "border-[#FFD700]/20";
      case "claim":
        return "border-green-500/20";
      case "cancel":
        return "border-red-500/20";
      case "dispute":
        return "border-yellow-500/20";
      default:
        return "border-[#40E0D0]/20";
    }
  };

  const getConfirmButtonClass = () => {
    switch (action) {
      case "lock":
        return "bg-[#FFD700] hover:bg-[#FFD700]/80 text-black";
      case "claim":
        return "bg-green-500 hover:bg-green-500/80 text-white";
      case "cancel":
        return "bg-red-500 hover:bg-red-500/80 text-white";
      case "dispute":
        return "bg-yellow-500 hover:bg-yellow-500/80 text-black";
      default:
        return "bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-black";
    }
  };

  const totalCost = orderData ? orderData.mon + orderData.takerBond : BigInt(0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className={`bg-gray-900 rounded-xl p-6 max-w-md w-full border ${getActionColor()}`}>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="text-3xl">{getActionIcon()}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Orden ID:</span>
                <span className="text-[#FFD700] font-semibold">#{orderData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monto MXN:</span>
                <span className="text-white font-semibold">{orderData.mxn.toString()} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Equivalente MON:</span>
                <span className="text-[#40E0D0] font-semibold">{formatEther(orderData.mon)} MON</span>
              </div>
              {action === "lock" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bono de Taker:</span>
                    <span className="text-yellow-400 font-semibold">+{formatEther(orderData.takerBond)} MON</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-semibold">Total a Pagar:</span>
                    <span className="text-[#FFD700] font-bold">{formatEther(totalCost)} MON</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {action === "lock" && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
            <div className="text-yellow-400 text-sm">
              <strong>⚠️ Importante:</strong> Asegúrate de tener suficiente MON en tu billetera. El bono será devuelto
              al completar la orden exitosamente.
            </div>
          </div>
        )}

        {action === "claim" && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6">
            <div className="text-green-400 text-sm">
              <strong>🏆 Completar Orden:</strong> Esta acción liberará los fondos y completará la transacción.
              Asegúrate de haber verificado el pago OXXO.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${getConfirmButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 px-4 rounded-lg transition-colors`}
          >
            {isLoading ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

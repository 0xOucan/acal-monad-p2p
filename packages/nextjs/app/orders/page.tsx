"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { PWAInstallPrompt } from "~~/components/PWAInstall";
import { Address } from "~~/components/scaffold-eth";
import { useLockOrder } from "~~/hooks/acal/useLockOrder";
import {
  type FrontendOrder,
  ORDER_STATUS,
  getOrderStatusText,
  useAllOrders,
  useGlobalStats,
} from "~~/hooks/acal/useOrdersGraphQL";

interface OrderCardProps {
  order: FrontendOrder;
  onLockOrder: (orderId: number, orderMon: bigint) => void;
  isLocking: boolean;
  lockingOrderId?: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onLockOrder, isLocking, lockingOrderId }) => {
  const { address: connectedAddress } = useAccount();

  const isExpired = order ? Number(order.expiry) * 1000 < Date.now() : false;
  const isMaker =
    connectedAddress && order?.maker ? order.maker.toLowerCase() === connectedAddress.toLowerCase() : false;
  const canLock = order && order.status === ORDER_STATUS.OPEN && !isExpired && !isMaker;

  const getStatusIcon = () => {
    if (!order) return "❓";
    switch (order.status) {
      case ORDER_STATUS.OPEN:
        return "🛶"; // Canoa vacía
      case ORDER_STATUS.LOCKED:
        return "⛵"; // Canoa con pasajero
      case ORDER_STATUS.COMPLETED:
        return "🏆"; // Canoa dorada
      case ORDER_STATUS.CANCELLED:
        return "💔"; // Canoa rota
      case ORDER_STATUS.EXPIRED:
        return "⚰️"; // Canoa hundida
      default:
        return "❓";
    }
  };

  const getStatusColor = () => {
    if (!order) return "text-gray-400";
    switch (order.status) {
      case ORDER_STATUS.OPEN:
        return "text-[#40E0D0]";
      case ORDER_STATUS.LOCKED:
        return "text-yellow-500";
      case ORDER_STATUS.COMPLETED:
        return "text-[#FFD700]";
      case ORDER_STATUS.CANCELLED:
        return "text-red-500";
      case ORDER_STATUS.EXPIRED:
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="acal-card rounded-xl p-4 border-2 border-[#40E0D0]/20 hover:border-[#40E0D0]/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <span className="text-lg font-bold text-[#FFD700]">#{order.id}</span>
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {order ? getOrderStatusText(order.status) : "Desconocido"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <span className="text-gray-400">Monto:</span>
          <div className="text-white font-semibold">{order?.mxn?.toString() || "0"} MXN</div>
        </div>
        <div>
          <span className="text-gray-400">MON:</span>
          <div className="text-[#40E0D0] font-semibold">{order ? formatEther(order.mon) : "0"}</div>
        </div>
        <div>
          <span className="text-gray-400">Maker:</span>
          <div className="text-xs">{order?.maker && <Address address={order.maker} size="xs" />}</div>
        </div>
        <div>
          <span className="text-gray-400">Expira:</span>
          <div className="text-xs">
            {order ? new Date(Number(order.expiry) * 1000).toLocaleDateString("es-MX") : "-"}
          </div>
        </div>
      </div>

      {isMaker && (
        <div className="bg-blue-500/10 rounded-lg p-2 text-center">
          <span className="text-sm text-blue-400">Tu Orden</span>
        </div>
      )}

      {canLock && order && (
        <button
          onClick={() => onLockOrder(parseInt(order.id), order.mon)}
          disabled={isLocking}
          className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLocking && lockingOrderId === parseInt(order.id) ? "Bloqueando..." : "⛵ Tomar Orden"}
        </button>
      )}

      {order && order.status === ORDER_STATUS.OPEN && isExpired && (
        <div className="bg-red-500/10 rounded-lg p-2 text-center">
          <span className="text-sm text-red-400">Orden Expirada</span>
        </div>
      )}
    </div>
  );
};

const OrdersPage: NextPage = () => {
  const router = useRouter();
  const { orders, isLoading: isLoadingOrders, error: ordersError } = useAllOrders();
  const { stats } = useGlobalStats();
  const { lockOrder, isLocking } = useLockOrder();
  const [lockingOrderId, setLockingOrderId] = useState<number | undefined>();

  const handleLockOrder = async (orderId: number, orderMon: bigint) => {
    try {
      setLockingOrderId(orderId);
      const toastId = toast.loading("Bloqueando orden...");

      await lockOrder(orderId, orderMon);

      toast.success("¡Orden bloqueada exitosamente!", { id: toastId });
    } catch (error) {
      console.error("Error locking order:", error);
      toast.error("Error al bloquear la orden: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLockingOrderId(undefined);
    }
  };

  return (
    <div className="min-h-screen acal-bg text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#FFD700] pixel-font">🛶 Mercado ACAL</h1>
            <p className="text-[#40E0D0] text-lg">Navega entre órdenes disponibles</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="acal-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🛶</div>
            <div className="text-sm text-gray-400">Total Órdenes</div>
            <div className="text-xl font-bold text-[#FFD700]">{stats?.totalOrders || "0"}</div>
          </div>
          <div className="acal-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">⛵</div>
            <div className="text-sm text-gray-400">Activas</div>
            <div className="text-xl font-bold text-[#40E0D0]">{stats?.openOrders || "0"}</div>
          </div>
          <div className="acal-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm text-gray-400">Completadas</div>
            <div className="text-xl font-bold text-green-500">{stats?.completedOrders || "0"}</div>
          </div>
          <div className="acal-card rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-sm text-gray-400">Volumen MXN</div>
            <div className="text-xl font-bold text-[#FFD700]">
              {stats ? (parseInt(stats.totalVolumeMXN) / 1000).toFixed(0) + "K" : "0"}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {ordersError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <div className="text-red-400 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="font-semibold">Error al cargar órdenes</div>
              <div className="text-sm mt-1">{ordersError}</div>
              <div className="text-xs mt-2 text-gray-400">Asegúrate de que el indexador Envio esté ejecutándose</div>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingOrders ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🛶</div>
              <h3 className="text-xl font-semibold text-[#40E0D0] mb-2">Cargando órdenes...</h3>
              <p className="text-gray-400">Conectando con el indexador Envio</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🏝️</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay órdenes aún</h3>
              <p className="text-gray-400 mb-6">¡Sé el primero en crear una orden!</p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Crear Primera Orden
              </button>
            </div>
          ) : (
            orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onLockOrder={handleLockOrder}
                isLocking={isLocking}
                lockingOrderId={lockingOrderId}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-400">
          <p>🛶 Tu canoa a Monad • Navega con confianza</p>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      <style jsx global>{`
        .acal-bg {
          background: linear-gradient(135deg, #002147 0%, #003366 100%);
          min-height: 100vh;
        }

        .acal-card {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(64, 224, 208, 0.1);
        }

        .pixel-font {
          font-family: "Courier New", monospace;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;

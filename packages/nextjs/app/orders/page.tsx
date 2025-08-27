"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "~~/components/ConfirmDialog";
import { PWAInstallPrompt } from "~~/components/PWAInstall";
import { TransactionStatus, type TransactionStep } from "~~/components/TransactionStatus";
import { Address } from "~~/components/scaffold-eth";
import { useCompleteOrder } from "~~/hooks/acal/useCompleteOrder";
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
  onClaimOrder: (orderId: number) => void;
  isLocking: boolean;
  isClaiming: boolean;
  lockingOrderId?: number;
  claimingOrderId?: number;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onLockOrder,
  onClaimOrder,
  isLocking,
  isClaiming,
  lockingOrderId,
  claimingOrderId,
}) => {
  const { address: connectedAddress } = useAccount();

  const isExpired = order ? Number(order.expiry) * 1000 < Date.now() : false;
  const isMaker =
    connectedAddress && order?.maker ? order.maker.toLowerCase() === connectedAddress.toLowerCase() : false;
  const isTaker =
    connectedAddress && order?.taker ? order.taker.toLowerCase() === connectedAddress.toLowerCase() : false;
  const canLock = order && order.status === ORDER_STATUS.OPEN && !isExpired && !isMaker;
  const canClaim = order && order.status === ORDER_STATUS.LOCKED && isTaker;

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
          <span className="text-gray-400">Taker:</span>
          <div className="text-xs">
            {order?.taker && order.taker !== "0x0000000000000000000000000000000000000000" ? (
              <Address address={order.taker} size="xs" />
            ) : (
              <span className="text-gray-500">Sin asignar</span>
            )}
          </div>
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
          className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition-colors mb-2"
        >
          {isLocking && lockingOrderId === parseInt(order.id) ? "Bloqueando..." : "⛵ Tomar Orden"}
        </button>
      )}

      {canClaim && order && (
        <button
          onClick={() => onClaimOrder(parseInt(order.id))}
          disabled={isClaiming}
          className="w-full bg-green-500 hover:bg-green-500/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isClaiming && claimingOrderId === parseInt(order.id) ? "Reclamando..." : "🏆 Reclamar Orden"}
        </button>
      )}

      {isTaker && order && order.status === ORDER_STATUS.LOCKED && (
        <div className="bg-green-500/10 rounded-lg p-2 text-center mt-2">
          <span className="text-sm text-green-400">Tu orden bloqueada - ¡Lista para reclamar!</span>
        </div>
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
  const { isLoading: isLoadingOrders } = useAllOrders();
  const { stats } = useGlobalStats();
  const { lockOrder, isLocking, getTakerBond } = useLockOrder();
  const { completeOrderDemo, isCompleting } = useCompleteOrder();

  // UI State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "lock" | "claim";
    orderId: number;
    orderData?: any;
  }>({ isOpen: false, action: "lock", orderId: 0 });

  const [transactionStatus, setTransactionStatus] = useState<{
    isOpen: boolean;
    steps: TransactionStep[];
    txHash?: any;
    action: "lock" | "claim";
  }>({ isOpen: false, steps: [], action: "lock" });

  // Fallback orders from your contract data for development
  const fallbackOrders: FrontendOrder[] = [
    {
      id: "24",
      maker: "0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0",
      taker: undefined,
      cr: "0x6a06a5f29b82a9c854b983873ac5ab07d7ac10a344d321569c0a0cb8e492cdc2",
      hashQR: "0x2410d412de8e1d9930cdce09c889a9a033ec0db99d71499cc51e75345c05919f",
      mxn: BigInt(100),
      mon: BigInt("1000000000000000000"), // 1 ETH
      expiry: BigInt(1756655545),
      status: 0, // OPEN
      makerBond: BigInt("50000000000000000"), // 0.05 ETH
      takerBond: BigInt("50000000000000000"), // 0.05 ETH
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    },
    {
      id: "25",
      maker: "0x843914e5BBdbE92296F2c3D895D424301b3517fC",
      taker: undefined,
      cr: "0x6f901bfddce870364d8c166246fd0b983aa3ac261f848e63b7565e6ec24356e2",
      hashQR: "0x4153212a34646101ccf06369113ba3ffcd2dd6c65913a5f7241070675d5dfce2",
      mxn: BigInt(100),
      mon: BigInt("1000000000000000000"), // 1 ETH
      expiry: BigInt(1756653032),
      status: 0, // OPEN
      makerBond: BigInt("50000000000000000"), // 0.05 ETH
      takerBond: BigInt("50000000000000000"), // 0.05 ETH
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    },
    {
      id: "26",
      maker: "0x843914e5BBdbE92296F2c3D895D424301b3517fC",
      taker: undefined,
      cr: "0x2f3a273d4360ee6224386c7ef8b238982ce5b2c7ec1f664dc3b42c1c110193fa",
      hashQR: "0x8fe5516233d10f58edc59596deb904d324413355ad4d7454be72d2e7f5e27524",
      mxn: BigInt(100),
      mon: BigInt("1000000000000000000"), // 1 ETH
      expiry: BigInt(1756652111),
      status: 0, // OPEN
      makerBond: BigInt("50000000000000000"), // 0.05 ETH
      takerBond: BigInt("50000000000000000"), // 0.05 ETH
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    },
    {
      id: "21",
      maker: "0x843914e5BBdbE92296F2c3D895D424301b3517fC",
      taker: undefined,
      cr: "0x2f3a273d4360ee6224386c7ef8b238982ce5b2c7ec1f664dc3b42c1c110193fa",
      hashQR: "0x8fe5516233d10f58edc59596deb904d324413355ad4d7454be72d2e7f5e27524",
      mxn: BigInt(100),
      mon: BigInt("1000000000000000000"), // 1 ETH
      expiry: BigInt(1756652111),
      status: 0, // OPEN
      makerBond: BigInt("50000000000000000"), // 0.05 ETH
      takerBond: BigInt("50000000000000000"), // 0.05 ETH
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    },
    {
      id: "20",
      maker: "0x843914e5BBdbE92296F2c3D895D424301b3517fC",
      taker: undefined,
      cr: "0x4e7110662d4f002f334f46351dfcb7d39d9a7e2342f1b3519b2e7b4ba41cdabb",
      hashQR: "0x0a199776820a711945d14fe3898c63d2f704c27fdab67b99ce50ba211c628af9",
      mxn: BigInt(100),
      mon: BigInt("1000000000000000000"), // 1 ETH
      expiry: BigInt(1756651606),
      status: 0, // OPEN
      makerBond: BigInt("50000000000000000"), // 0.05 ETH
      takerBond: BigInt("50000000000000000"), // 0.05 ETH
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    },
    {
      id: "19",
      maker: "0x843914e5BBdbE92296F2c3D895D424301b3517fC",
      taker: undefined,
      cr: "0x33244ccbb346a71e186412acafa4b9cd90e2bd7b40c94cec63556c8f7ff47358",
      hashQR: "0xf62f33e2d0cefdb2eeef346e897c14c7cd074514fbbdc4689591daffa1fc16d5",
      mxn: BigInt(100),
      mon: BigInt("1000000000000000000"), // 1 ETH
      expiry: BigInt(1756651031),
      status: 0, // OPEN
      makerBond: BigInt("50000000000000000"), // 0.05 ETH
      takerBond: BigInt("50000000000000000"), // 0.05 ETH
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    },
  ];

  // Always use fallback orders for now (disable Envio GraphQL dependency)
  const orders = fallbackOrders;

  // Show confirmation dialog for locking order
  const handleLockOrder = (orderId: number, orderMon: bigint) => {
    const order = orders.find(o => parseInt(o.id) === orderId);
    if (!order) return;

    setConfirmDialog({
      isOpen: true,
      action: "lock",
      orderId,
      orderData: {
        orderId: order.id,
        maker: order.maker,
        mxn: order.mxn,
        mon: orderMon,
        takerBond: getTakerBond(),
      },
    });
  };

  // Show confirmation dialog for claiming order
  const handleClaimOrder = (orderId: number) => {
    const order = orders.find(o => parseInt(o.id) === orderId);
    if (!order) return;

    setConfirmDialog({
      isOpen: true,
      action: "claim",
      orderId,
      orderData: {
        orderId: order.id,
        maker: order.maker,
        mxn: order.mxn,
        mon: order.mon,
        takerBond: getTakerBond(),
      },
    });
  };

  // Execute the actual lock transaction
  const executeLockOrder = async (orderId: number, orderMon: bigint) => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    // Setup transaction status modal
    const lockSteps: TransactionStep[] = [
      { id: "sign", title: "Firma la transacción", description: "Confirma en tu billetera", status: "active" },
      {
        id: "pending",
        title: "Transacción pendiente",
        description: "Esperando confirmación en blockchain",
        status: "pending",
      },
      { id: "confirmed", title: "Orden bloqueada", description: "¡Fondos asegurados exitosamente!", status: "pending" },
    ];

    setTransactionStatus({
      isOpen: true,
      steps: lockSteps,
      action: "lock",
    });

    try {
      const result = await lockOrder(orderId, orderMon);

      if (result.success && result.txHash) {
        // Update steps to show transaction is pending
        setTransactionStatus(prev => ({
          ...prev,
          steps: prev.steps.map((step, index) => ({
            ...step,
            status: index === 0 ? "completed" : index === 1 ? "active" : "pending",
          })),
          txHash: result.txHash,
        }));
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error locking order:", error);
      toast.error("Error al bloquear la orden: " + (error instanceof Error ? error.message : String(error)));
      setTransactionStatus({ isOpen: false, steps: [], action: "lock" });
    }
  };

  // Execute the actual claim transaction
  const executeClaimOrder = async (orderId: number) => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    // Setup transaction status modal
    const claimSteps: TransactionStep[] = [
      { id: "sign", title: "Firma la completación", description: "Confirma en tu billetera", status: "active" },
      { id: "pending", title: "Procesando completación", description: "Liberando fondos y bonos", status: "pending" },
      { id: "completed", title: "Orden completada", description: "¡Transacción exitosa!", status: "pending" },
    ];

    setTransactionStatus({
      isOpen: true,
      steps: claimSteps,
      action: "claim",
    });

    try {
      const result = await completeOrderDemo(orderId);

      if (result.success && result.txHash) {
        // Update steps to show transaction is pending
        setTransactionStatus(prev => ({
          ...prev,
          steps: prev.steps.map((step, index) => ({
            ...step,
            status: index === 0 ? "completed" : index === 1 ? "active" : "pending",
          })),
          txHash: result.txHash,
        }));
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error claiming order:", error);
      toast.error("Error al reclamar la orden: " + (error instanceof Error ? error.message : String(error)));
      setTransactionStatus({ isOpen: false, steps: [], action: "claim" });
    }
  };

  return (
    <div className="min-h-screen acal-bg text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#FFD700] pixel-font">🛶 Mercado ACAL</h1>
              <p className="text-[#40E0D0] text-lg">Navega entre órdenes disponibles</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Órdenes encontradas:</div>
            <div className="text-2xl font-bold text-[#FFD700]">{orders.length}</div>
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

        {/* Development Mode Display */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
          <div className="text-blue-400 text-center">
            <div className="text-2xl mb-2">🚧</div>
            <div className="font-semibold">Modo Desarrollo - Órdenes del Contrato</div>
            <div className="text-sm mt-1">
              Mostrando {fallbackOrders.length} órdenes directamente del contrato (IDs: 19-26)
            </div>
            <div className="text-xs mt-2 text-gray-400">Funcionalidad completa de lock/claim disponible</div>
          </div>
        </div>

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
            // Sort orders by ID descending to show newest first
            orders
              .sort((a, b) => parseInt(b.id) - parseInt(a.id))
              .map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onLockOrder={handleLockOrder}
                  onClaimOrder={handleClaimOrder}
                  isLocking={isLocking}
                  isClaiming={isCompleting}
                  lockingOrderId={undefined}
                  claimingOrderId={undefined}
                />
              ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-400">
          <p>🛶 Tu canoa a Monad • Navega con confianza</p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.action === "lock" && confirmDialog.orderData) {
            executeLockOrder(confirmDialog.orderId, confirmDialog.orderData.mon);
          } else if (confirmDialog.action === "claim") {
            executeClaimOrder(confirmDialog.orderId);
          }
        }}
        title={confirmDialog.action === "lock" ? "Bloquear Orden" : "Reclamar Orden"}
        description={
          confirmDialog.action === "lock"
            ? "Confirma el pago para bloquear esta orden"
            : "Confirma para completar y reclamar esta orden"
        }
        orderData={confirmDialog.orderData}
        isLoading={isLocking || isCompleting}
        action={confirmDialog.action}
      />

      {/* Transaction Status Modal */}
      {transactionStatus.isOpen && (
        <TransactionStatus
          txHash={transactionStatus.txHash}
          steps={transactionStatus.steps}
          onClose={() => setTransactionStatus({ isOpen: false, steps: [], action: "lock" })}
          onSuccess={() => {
            setTransactionStatus(prev => ({
              ...prev,
              steps: prev.steps.map(step => ({ ...step, status: "completed" as const })),
            }));
            toast.success(
              transactionStatus.action === "lock"
                ? "¡Orden bloqueada exitosamente!"
                : "¡Orden completada exitosamente!",
            );
          }}
          onError={error => {
            setTransactionStatus(prev => ({
              ...prev,
              steps: prev.steps.map(step => ({
                ...step,
                status: step.status === "active" ? ("failed" as const) : step.status,
              })),
            }));
            toast.error("Error en la transacción: " + error);
          }}
        />
      )}

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

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { QRScanner } from "~~/components/QRScanner";
import { TransactionStatus, type TransactionStep } from "~~/components/TransactionStatus";
import { Address } from "~~/components/scaffold-eth";
import { useCompleteOrder } from "~~/hooks/acal/useCompleteOrder";
import { type FrontendOrder, ORDER_STATUS } from "~~/hooks/acal/useOrdersGraphQL";

const ClaimOrderPage: NextPage = () => {
  const router = useRouter();
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const { completeOrderDemo, isCompleting } = useCompleteOrder();

  const [step, setStep] = useState<"instructions" | "scanning" | "processing">("instructions");
  const [transactionStatus, setTransactionStatus] = useState<{
    isOpen: boolean;
    steps: TransactionStep[];
    txHash?: any;
  }>({ isOpen: false, steps: [] });

  // Mock order data - in real app, fetch from contract or GraphQL
  const [order] = useState<FrontendOrder>({
    id: (params?.id as string) || "24",
    maker: "0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0",
    taker: connectedAddress,
    cr: "0x6a06a5f29b82a9c854b983873ac5ab07d7ac10a344d321569c0a0cb8e492cdc2",
    hashQR: "0x2410d412de8e1d9930cdce09c889a9a033ec0db99d71499cc51e75345c05919f",
    mxn: BigInt(100),
    mon: BigInt("1000000000000000000"),
    expiry: BigInt(1756655545),
    status: ORDER_STATUS.LOCKED,
    makerBond: BigInt("50000000000000000"),
    takerBond: BigInt("50000000000000000"),
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
  });

  const handleStartScanning = () => {
    setStep("scanning");
  };

  const handleQRScanned = (data: string) => {
    console.log("QR Scanned:", data);

    // Simulate QR validation
    toast.success("¡Código QR de OXXO detectado!");

    // Show confirmation dialog
    setTimeout(() => {
      handleConfirmPayment();
    }, 1000);
  };

  const handleConfirmPayment = async () => {
    setStep("processing");

    // Setup transaction status modal
    const claimSteps: TransactionStep[] = [
      {
        id: "verify",
        title: "Verificando pago OXXO",
        description: "Confirmando el código QR escaneado",
        status: "completed",
      },
      { id: "sign", title: "Firma la completación", description: "Confirma en tu billetera", status: "active" },
      { id: "pending", title: "Procesando completación", description: "Liberando fondos y bonos", status: "pending" },
      { id: "completed", title: "¡Pago completado!", description: "Fondos liberados exitosamente", status: "pending" },
    ];

    setTransactionStatus({
      isOpen: true,
      steps: claimSteps,
    });

    try {
      const result = await completeOrderDemo(parseInt(order.id));

      if (result.success && result.txHash) {
        setTransactionStatus(prev => ({
          ...prev,
          steps: prev.steps.map((step, index) => ({
            ...step,
            status: index <= 1 ? "completed" : index === 2 ? "active" : "pending",
          })),
          txHash: result.txHash,
        }));
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error claiming order:", error);
      toast.error("Error al completar la orden: " + (error instanceof Error ? error.message : String(error)));
      setTransactionStatus({ isOpen: false, steps: [] });
      setStep("instructions");
    }
  };

  const handleTransactionSuccess = () => {
    setTransactionStatus(prev => ({
      ...prev,
      steps: prev.steps.map(step => ({ ...step, status: "completed" as const })),
    }));
    toast.success("¡Orden completada exitosamente! 🎉");

    // Navigate to success page after completion
    setTimeout(() => {
      router.push("/orders/success");
    }, 2000);
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
            <h1 className="text-3xl font-bold text-[#FFD700] pixel-font">🏆 Reclamar Orden #{order.id}</h1>
            <p className="text-[#40E0D0] text-lg">Escanea el código QR de OXXO para completar</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="acal-card rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#FFD700] mb-4">📋 Resumen de la Orden</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Monto MXN:</span>
              <div className="text-white font-semibold text-lg">{order.mxn.toString()} MXN</div>
            </div>
            <div>
              <span className="text-gray-400">Equivalente MON:</span>
              <div className="text-[#40E0D0] font-semibold text-lg">{formatEther(order.mon)} MON</div>
            </div>
            <div>
              <span className="text-gray-400">Maker:</span>
              <div className="text-xs">
                <Address address={order.maker} size="xs" />
              </div>
            </div>
            <div>
              <span className="text-gray-400">Estado:</span>
              <div className="text-yellow-400 font-semibold">⛵ Bloqueada</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === "instructions" && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="acal-card rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#FFD700] mb-4">📱 Instrucciones</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">1️⃣</div>
                  <div>
                    <div className="font-semibold">Ve a cualquier OXXO</div>
                    <div className="text-sm">Busca la máquina SPIN en la tienda</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">2️⃣</div>
                  <div>
                    <div className="font-semibold">Deposita {order.mxn.toString()} MXN</div>
                    <div className="text-sm">La máquina generará un código QR único</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">3️⃣</div>
                  <div>
                    <div className="font-semibold">Escanea el código QR</div>
                    <div className="text-sm">Usa esta app para validar tu pago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleStartScanning}
              disabled={isCompleting}
              className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 text-black font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <QrCodeIcon className="h-6 w-6" />
              <span>Iniciar Escaneo QR</span>
            </button>
          </div>
        )}

        {step === "scanning" && (
          <div className="space-y-6">
            <div className="acal-card rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#FFD700] mb-4">📷 Escanear Código QR</h2>
              <p className="text-gray-300 mb-6">Apunta tu cámara al código QR que generó la máquina SPIN en OXXO</p>

              <QRScanner
                onScanSuccess={handleQRScanned}
                onScanError={(error: string) => {
                  console.error("QR Scanner error:", error);
                  toast.error("Error al escanear QR");
                }}
                isActive={true}
              />
            </div>

            <button
              onClick={() => setStep("instructions")}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Volver a Instrucciones
            </button>
          </div>
        )}

        {step === "processing" && !transactionStatus.isOpen && (
          <div className="acal-card rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-[#FFD700] mb-2">Procesando...</h2>
            <p className="text-gray-300">Preparando la transacción de completación</p>
          </div>
        )}

        {/* Transaction Status Modal */}
        {transactionStatus.isOpen && (
          <TransactionStatus
            txHash={transactionStatus.txHash}
            steps={transactionStatus.steps}
            onClose={() => setTransactionStatus({ isOpen: false, steps: [] })}
            onSuccess={handleTransactionSuccess}
            onError={error => {
              toast.error("Error en la transacción: " + error);
              setStep("instructions");
              setTransactionStatus({ isOpen: false, steps: [] });
            }}
          />
        )}
      </div>

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

export default ClaimOrderPage;

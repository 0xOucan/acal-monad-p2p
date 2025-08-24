"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon, ListBulletIcon, QrCodeIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { QRScanner } from "~~/components/QRScanner";
import { Address } from "~~/components/scaffold-eth";
import { useCreateOrder } from "~~/hooks/acal/useCreateOrder";
import { useNextOrderId } from "~~/hooks/acal/useOrders";
import {
  ParsedSpinQR,
  formatMonAmount,
  generateTestSpinQR,
  isSpinQRValid,
  mxnToMon,
  parseSpinQR,
} from "~~/utils/spinQR";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedQR, setScannedQR] = useState<ParsedSpinQR | null>(null);
  const [step, setStep] = useState<"scan" | "create" | "confirm">("scan");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const { createOrder, isCreating } = useCreateOrder();
  const { nextId } = useNextOrderId();

  const handleQRScan = (qrText: string) => {
    try {
      const parsed = parseSpinQR(qrText);

      if (!isSpinQRValid(parsed)) {
        toast.error("El código QR ha expirado");
        return;
      }

      if (parsed.amount < 100 || parsed.amount > 500) {
        toast.error("El monto debe estar entre 100 y 500 MXN");
        return;
      }

      setScannedQR(parsed);
      setStep("create");
      setShowScanner(false);
      toast.success("QR escaneado correctamente");
    } catch (error) {
      toast.error("QR inválido: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleCreateOrder = async () => {
    if (!scannedQR || !isConnected) return;

    try {
      const toastId = toast.loading("Creando orden en la blockchain...");

      // Get the next order ID before creating
      const orderIdBefore = nextId ? Number(nextId) : 0;

      await createOrder(scannedQR);

      setCreatedOrderId(orderIdBefore);
      setStep("confirm");

      toast.success("¡Orden creada exitosamente!", { id: toastId });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al crear la orden: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const testWithExampleQR = () => {
    const uniqueTestQR = generateTestSpinQR();
    handleQRScan(uniqueTestQR);
  };

  return (
    <div className="min-h-screen acal-bg text-white">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div> {/* Spacer */}
            <div>
              <h1 className="text-4xl font-bold text-[#FFD700] mb-2 pixel-font">🛶 ACAL</h1>
              <p className="text-lg text-[#40E0D0]">Tu canoa a Monad</p>
            </div>
            <Link
              href="/orders"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Ver todas las órdenes"
            >
              <ListBulletIcon className="h-6 w-6 text-[#40E0D0]" />
            </Link>
          </div>

          <p className="text-sm text-gray-300 mb-4">De pesos mexicanos directo a Monad, en pocos clics</p>

          {isConnected && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg">
              <Address address={connectedAddress} />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {step === "scan" && (
            <div className="acal-card rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-center mb-6 text-[#FFD700] pixel-font">
                🏺 Crear Orden de Venta
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-[#40E0D0]/10 rounded-lg">
                  <QrCodeIcon className="h-6 w-6 text-[#40E0D0]" />
                  <span>Escanea tu código QR SPIN de OXXO</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[#FFD700]/10 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-[#FFD700]" />
                  <span>Recibe MON tokens automáticamente</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                  <span>Transacción segura con escrow</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowScanner(true)}
                  disabled={!isConnected}
                  className="w-full bg-[#40E0D0] hover:bg-[#40E0D0]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg transition-colors"
                >
                  {isConnected ? "Escanear QR SPIN" : "Conecta tu Wallet"}
                </button>

                <button
                  onClick={testWithExampleQR}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  🎲 Generar QR de Prueba (100 MXN)
                </button>

                <Link
                  href="/orders"
                  className="w-full bg-[#002147] border-2 border-[#40E0D0] hover:bg-[#40E0D0]/10 text-[#40E0D0] font-medium py-2 px-4 rounded-lg transition-colors text-sm text-center block"
                >
                  🛶 Ver Mercado de Órdenes
                </Link>
              </div>
            </div>
          )}

          {step === "create" && scannedQR && (
            <div className="acal-card rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-center mb-6 text-[#FFD700] pixel-font">⚖️ Confirmar Orden</h2>

              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[#FFD700] mb-2">Detalles del Pago OXXO</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">CR:</span>
                      <span className="ml-2 font-mono">{scannedQR.cr}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Monto:</span>
                      <span className="ml-2">{scannedQR.amount} MXN</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Expira:</span>
                      <span className="ml-2">{scannedQR.expiry.toLocaleDateString("es-MX")}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Recibirás:</span>
                      <span className="ml-2 text-[#40E0D0]">{formatMonAmount(mxnToMon(scannedQR.amount))}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-500 mb-2">💡 Cómo funciona:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Tu orden se publica en la red</li>
                    <li>Un comprador toma tu orden y bloquea MON tokens</li>
                    <li>Tú pagas en OXXO con este QR</li>
                    <li>Los tokens se liberan automáticamente</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCreateOrder}
                  disabled={isCreating}
                  className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg transition-colors"
                >
                  {isCreating ? "Creando..." : "Crear Orden P2P"}
                </button>

                <button
                  onClick={() => {
                    setStep("scan");
                    setScannedQR(null);
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Volver
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="acal-card rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-semibold text-[#FFD700] mb-4 pixel-font">¡Canoa Lista para Navegar!</h2>
              <p className="text-gray-300 mb-6">
                Tu orden está ahora disponible en la red P2P. Los compradores pueden verla y tomar tu oferta.
              </p>

              {createdOrderId !== null && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">ID de la Orden:</span> #{createdOrderId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Guarda este ID para hacer seguimiento de tu orden</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep("scan");
                    setScannedQR(null);
                  }}
                  className="w-full bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  🛶 Crear Nueva Orden
                </button>

                <Link
                  href="/orders"
                  className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 text-black font-bold py-3 px-6 rounded-lg transition-colors text-center block"
                >
                  🏪 Ir al Mercado
                </Link>
              </div>
            </div>
          )}

          {/* QR Scanner Modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-[#002147] rounded-xl p-6 w-full max-w-md">
                <QRScanner
                  isActive={showScanner}
                  onScanSuccess={handleQRScan}
                  onScanError={error => {
                    console.error("QR scan error:", error);
                    toast.error("Error al escanear QR");
                  }}
                />

                <button
                  onClick={() => setShowScanner(false)}
                  className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-400">
          <p className="pixel-font">🛶 Tu canoa a Monad • Navega con confianza 🌊</p>
        </div>
      </div>

      <style jsx global>{`
        .pixel-font {
          font-family: "Courier New", monospace;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Home;

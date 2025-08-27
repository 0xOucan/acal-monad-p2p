"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";

const OrderSuccessPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/orders");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen acal-bg text-white flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="acal-card rounded-xl p-8 max-w-md mx-auto">
          {/* Success Animation */}
          <div className="text-8xl mb-6 animate-bounce">🎉</div>

          <h1 className="text-3xl font-bold text-[#FFD700] mb-4 pixel-font">¡Orden Completada!</h1>

          <p className="text-[#40E0D0] text-lg mb-6">Tu transacción ha sido procesada exitosamente</p>

          <div className="space-y-4 mb-8">
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-green-400 font-semibold">✅ Pago OXXO verificado</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-green-400 font-semibold">✅ Fondos liberados</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-green-400 font-semibold">✅ Bonos devueltos</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Ver Mis Órdenes
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-[#40E0D0] hover:bg-[#40E0D0]/80 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Crear Nueva Orden
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-6">Serás redirigido automáticamente en 5 segundos...</p>
        </div>
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

export default OrderSuccessPage;

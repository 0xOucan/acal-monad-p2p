"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.navigator && (window.navigator as any).standalone) {
        // iOS Safari
        setIsInstalled(true);
      } else if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
        // Desktop/Android
        setIsInstalled(true);
      }
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(beforeInstallPromptEvent);
      // Show our custom install button
      setShowInstallPrompt(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkInstalled();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="acal-card rounded-xl p-4 border-2 border-[#40E0D0]/50 shadow-xl animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🛶</span>
            <div>
              <h3 className="text-lg font-bold text-[#FFD700]">Instalar ACAL</h3>
              <p className="text-sm text-[#40E0D0]">Tu canoa siempre contigo</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-300 flex-1 mr-3">
            Instala ACAL en tu dispositivo para acceso rápido y sin conexión
          </p>
          <button
            onClick={handleInstallClick}
            className="bg-[#FFD700] hover:bg-[#FFD700]/80 text-black font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap"
          >
            <span>📱</span>
            <span>Instalar</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .acal-card {
          background: rgba(0, 33, 71, 0.95);
          backdrop-filter: blur(10px);
        }

        @keyframes pulse {
          0%,
          100% {
            border-color: rgba(64, 224, 208, 0.3);
          }
          50% {
            border-color: rgba(64, 224, 208, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

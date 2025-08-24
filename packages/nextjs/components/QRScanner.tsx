"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isActive && !scannerRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      const scanner = new Html5QrcodeScanner("qr-reader", config, false);
      scannerRef.current = scanner;

      scanner.render(
        decodedText => {
          console.log("QR Code detected:", decodedText);
          try {
            // Try to parse as JSON (SPIN QR format)
            const qrData = JSON.parse(decodedText);
            console.log("Parsed SPIN QR:", qrData);
            onScanSuccess(decodedText);
          } catch {
            // If not JSON, treat as plain text
            console.log("Plain text QR:", decodedText);
            onScanSuccess(decodedText);
          }
          setScanning(true);
          // Auto-stop scanning after successful scan
          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.clear();
              scannerRef.current = null;
            }
            setScanning(false);
          }, 2000);
        },
        error => {
          if (onScanError && !error.includes("NotFoundException")) {
            onScanError(error);
          }
        },
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isActive, onScanSuccess, onScanError]);

  return (
    <div className="qr-scanner-container">
      {isActive && (
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white">Escanea tu código QR SPIN de OXXO</h3>
            <p className="text-sm text-gray-300">Apunta la cámara hacia el código QR</p>
          </div>
          <div id="qr-reader" className="border-2 border-dashed border-[#40E0D0] rounded-lg" />
          {scanning && <div className="text-center mt-4 text-green-500">¡QR detectado correctamente!</div>}
        </div>
      )}
    </div>
  );
};

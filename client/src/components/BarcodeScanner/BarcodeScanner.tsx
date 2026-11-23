'use client';

import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { ScannerViewfinder } from '@/components/ScannerViewfinder/ScannerViewfinder';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
}

export const BarcodeScanner = ({ onDetected }: BarcodeScannerProps) => {
  const { videoRef, status, error, start } = useBarcodeScanner({ onDetected });
  const canStart = status === 'idle' || status === 'error' || status === 'denied';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-black/40">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        <ScannerViewfinder className="absolute inset-0 m-auto" />
      </div>
      {status === 'starting' && <p className="text-sm text-white/80">Abriendo cámara…</p>}
      {canStart && (
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-6 py-3 text-sm font-semibold"
        >
          Iniciar cámara
        </button>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
};

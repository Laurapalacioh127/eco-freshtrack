'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { normalizeBarcode } from '@/utils/barcode';

export type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'unsupported' | 'denied' | 'error';

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
}

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

interface DecodeControls {
  stop: () => void;
}

const DETECTOR_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
const DETECT_INTERVAL_MS = 250;

const MSG_UNSUPPORTED = 'Tu dispositivo no permite usar la cámara. Ingresa el código manualmente';
const MSG_DENIED = 'Permite el acceso a la cámara o ingresa el código manualmente';
const MSG_NO_CAMERA = 'No encontramos una cámara';
const MSG_ERROR = 'No pudimos iniciar la cámara';

interface UseBarcodeScannerOptions {
  onDetected: (code: string) => void;
}

interface UseBarcodeScannerResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: ScannerStatus;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export const useBarcodeScanner = ({ onDetected }: UseBarcodeScannerOptions): UseBarcodeScannerResult => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsRef = useRef<DecodeControls | null>(null);
  const onDetectedRef = useRef(onDetected);
  // Incremented by every start/stop so an in-flight start can tell it was cancelled.
  const sessionRef = useRef(0);
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const release = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    release();
    setStatus((prev) => (prev === 'scanning' || prev === 'starting' ? 'idle' : prev));
  }, [release]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      setError(MSG_UNSUPPORTED);
      return;
    }

    release();
    sessionRef.current += 1;
    const session = sessionRef.current;
    const cancelled = () => sessionRef.current !== session;
    let handled = false;

    const handleValue = (raw: string) => {
      if (handled || cancelled()) return;
      const code = normalizeBarcode(raw);
      if (!code) return;
      handled = true;
      stop();
      onDetectedRef.current(code);
    };

    setStatus('starting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (cancelled()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        release();
        return;
      }
      video.srcObject = stream;
      await video.play();
      if (cancelled()) return;

      const Detector = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
        .BarcodeDetector;

      if (Detector) {
        const detector = new Detector({ formats: DETECTOR_FORMATS });
        let busy = false;
        intervalRef.current = setInterval(async () => {
          if (busy || handled) return;
          busy = true;
          try {
            const results = await detector.detect(video);
            for (const result of results) handleValue(result.rawValue);
          } catch {
            // A failed frame is ignored; the next tick tries again.
          } finally {
            busy = false;
          }
        }, DETECT_INTERVAL_MS);
      } else {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled()) return;
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoElement(video, (result) => {
          if (result) handleValue(result.getText());
        });
        if (cancelled()) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      }

      setStatus('scanning');
    } catch (err) {
      if (cancelled()) return;
      release();
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError') {
        setStatus('denied');
        setError(MSG_DENIED);
      } else if (name === 'NotFoundError') {
        setStatus('unsupported');
        setError(MSG_NO_CAMERA);
      } else {
        setStatus('error');
        setError(MSG_ERROR);
      }
    }
  }, [release, stop]);

  useEffect(
    () => () => {
      sessionRef.current += 1;
      release();
    },
    [release],
  );

  return { videoRef, status, error, start, stop };
};

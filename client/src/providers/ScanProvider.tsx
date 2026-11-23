'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAxios } from './AxiosProvider';
import type { ScannedProduct } from '@/types';

interface ScanContextValue {
  product: ScannedProduct | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

export const ScanProvider = ({ code, children }: { code: string | null; children: ReactNode }) => {
  const axios = useAxios();
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [loading, setLoading] = useState(code !== null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const onInit = async () => {
      if (code === null) {
        setProduct(null);
        setError('El código de barras no es válido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<ScannedProduct>(`/api/products/barcode/${code}`);
        if (cancelled) return;
        setProduct(res.data);
      } catch (err) {
        if (cancelled) return;
        setProduct(null);
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    onInit();

    return () => {
      cancelled = true;
    };
  }, [axios, code, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <ScanContext.Provider value={{ product, loading, error, retry }}>{children}</ScanContext.Provider>
  );
};

export const useScan = () => {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within a ScanProvider');
  return ctx;
};

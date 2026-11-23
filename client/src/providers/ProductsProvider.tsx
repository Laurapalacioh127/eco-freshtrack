'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAxios } from './AxiosProvider';
import type { Product, ProductCategory } from '@/types';
import { upsertById } from '@/utils/upsertById';

export interface CreateProductInput {
  name: string;
  category: ProductCategory;
  shelfLifeDays: number;
  substitutes: string[];
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  createProduct: (input: CreateProductInput) => Promise<Product>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onInit = async () => {
      try {
        const res = await axios.get<Product[]>('/api/products');
        setProducts(res.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    onInit();
  }, [axios]);

  const createProduct = useCallback(
    async (input: CreateProductInput) => {
      const res = await axios.post<Product>('/api/products', input);
      setProducts((prev) => upsertById(prev, res.data));
      return res.data;
    },
    [axios],
  );

  return (
    <ProductsContext.Provider value={{ products, loading, error, createProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};
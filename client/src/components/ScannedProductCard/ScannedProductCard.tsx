import Image from 'next/image';
import type { ScannedProduct } from '@/types';

interface ScannedProductCardProps {
  product: ScannedProduct;
}

export const ScannedProductCard = ({ product }: ScannedProductCardProps) => (
  <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
      {product.imageUrl ? (
        <Image src={product.imageUrl} alt="" fill sizes="80px" unoptimized className="object-cover" />
      ) : (
        <span aria-hidden className="flex h-full items-center justify-center text-3xl">
          🛒
        </span>
      )}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-light">{product.name}</p>
      <p className="text-sm text-brand">{product.category || 'Sin categoría'}</p>
      <p className="text-xs text-black/50">Código: {product.code}</p>
    </div>
  </div>
);

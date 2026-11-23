'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScanProvider, useScan } from '@/providers/ScanProvider';
import { useInventory, type AddInventoryItemInput } from '@/providers/InventoryProvider';
import { useToast } from '@/providers/ToastProvider';
import { normalizeBarcode } from '@/utils/barcode';
import { toProductCategory } from '@/utils/categories';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ScannedProductCard } from '@/components/ScannedProductCard/ScannedProductCard';
import { InventoryItemForm } from '@/components/InventoryItemForm/InventoryItemForm';

const secondaryLink = 'rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold';

const ScanResultView = ({ validCode }: { validCode: boolean }) => {
  const router = useRouter();
  const { product, loading, error, retry } = useScan();
  const { addItem } = useInventory();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (input: AddInventoryItemInput) => {
    setSubmitting(true);
    try {
      await addItem(input);
      showToast('Alimento agregado a tu inventario', 'success');
      router.push('/user/inventory');
    } catch (err) {
      showToast((err as Error).message);
      setSubmitting(false);
    }
  };

  if (loading) return <p>Buscando producto…</p>;

  if (error || !product) {
    return (
      <div role="alert" className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-red-600">{error ?? 'No encontramos el producto'}</p>
        <div className="flex flex-wrap gap-3">
          {validCode && (
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          )}
          <Link href="/user/scan" className={secondaryLink}>
            Volver a escanear
          </Link>
          <Link href="/user/scan/manual" className={secondaryLink}>
            Agregar manualmente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScannedProductCard product={product} />
      <InventoryItemForm
        submitting={submitting}
        initialValues={{ name: product.name, category: toProductCategory(product.category) }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

const ScanResultContent = () => {
  const code = normalizeBarcode(useSearchParams().get('code') ?? '');

  return (
    <ScanProvider code={code}>
      <div className="flex max-w-xl flex-col gap-6">
        <Link href="/user/scan" className="text-sm font-semibold">
          ← Volver al escáner
        </Link>
        <PageHeader
          eyebrow="PRODUCTO ESCANEADO"
          title="Revisa el producto"
          subtitle="Agrega la cantidad y la fecha de vencimiento antes de guardarlo."
        />
        <ScanResultView validCode={code !== null} />
      </div>
    </ScanProvider>
  );
};

const ScanResultPage = () => (
  <Suspense fallback={<p>Cargando…</p>}>
    <ScanResultContent />
  </Suspense>
);

export default ScanResultPage;

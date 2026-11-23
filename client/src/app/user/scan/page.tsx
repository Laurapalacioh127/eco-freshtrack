'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarcodeScanner } from '@/components/BarcodeScanner/BarcodeScanner';
import { ManualBarcodeForm } from '@/components/ManualBarcodeForm/ManualBarcodeForm';

const ScanPage = () => {
  const router = useRouter();

  const goToResult = (code: string) => {
    router.push(`/user/scan/result?code=${code}`);
  };

  return (
    <section className="flex min-h-[80vh] flex-col gap-6 rounded-3xl bg-ink p-6 text-white">
      <div className="flex items-center justify-between text-sm">
        <Link href="/user" aria-label="Cerrar escáner" className="text-xl">
          ✕
        </Link>
        <p className="font-semibold">Escáner de códigos de barras</p>
        <span className="w-5" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <BarcodeScanner onDetected={goToResult} />
        <p className="text-sm text-white/80">Centra el código de barras en el recuadro</p>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <ManualBarcodeForm onSubmit={goToResult} />
        <Link href="/user/scan/manual" className="text-sm text-white/80">
          Agregar manualmente
        </Link>
      </div>
    </section>
  );
};

export default ScanPage;

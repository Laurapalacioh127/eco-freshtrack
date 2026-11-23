'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDonations } from '@/providers/DonationsProvider';
import type { DonationStatus } from '@/types';
import { DonationTimeline } from '@/components/DonationTimeline/DonationTimeline';

const COPY: Record<DonationStatus, { title: string; detail: string }> = {
  pending: {
    title: 'Tu donación está pendiente',
    detail: 'Nuestro equipo la revisará pronto. Esta página se actualiza sola.',
  },
  approved: {
    title: 'Tu donación fue aprobada',
    detail: 'El equipo coordinará la recogida de tus productos.',
  },
  completed: {
    title: 'Tu donación fue entregada',
    detail: 'Gracias por darle una segunda oportunidad a tus alimentos.',
  },
};

const linkClass =
  'w-fit rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-6 py-3 text-sm font-semibold text-white';

// The status comes from DonationsProvider, which applies status-changed events live.
const DonationStatusView = () => {
  const id = useSearchParams().get('id');
  const { donations, loading, error } = useDonations();

  if (loading) return <p>Cargando el estado de tu donación…</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;

  const donation = donations.find((item) => item.id === id);

  if (!donation) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-light">No encontramos esta donación</h1>
        <Link href="/user" className={linkClass}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const approved = donation.status === 'approved' || donation.status === 'completed';
  const completed = donation.status === 'completed';
  const steps = [
    { title: 'Pendiente', detail: 'Donación registrada', done: true },
    { title: 'Aprobada', detail: approved ? 'El equipo la aprobó' : 'En espera de revisión', done: approved },
    { title: 'Completada', detail: completed ? 'Entregada' : 'Después de la entrega', done: completed },
  ];
  const copy = COPY[donation.status];

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <h1 className="text-4xl font-light">{copy.title}</h1>
      <p className="text-sm text-neutral-600">{copy.detail}</p>

      <DonationTimeline steps={steps} />

      <div className="flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Lugar de recogida</p>
          <p className="font-semibold">{donation.zone}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Alimentos</p>
          <p className="font-semibold">{donation.items}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Vencimiento</p>
          <p className="font-semibold">{donation.expiresLabel}</p>
        </div>
      </div>

      <Link href="/user" className={linkClass}>
        Volver al inicio
      </Link>
    </div>
  );
};

const DonationStatusPage = () => (
  <Suspense fallback={<p>Cargando el estado de tu donación…</p>}>
    <DonationStatusView />
  </Suspense>
);

export default DonationStatusPage;

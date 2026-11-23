import type { Donation, DonationStatus } from '@/types';
import { getInitials } from '@/utils/format';
import { DonationStatusBadge } from '@/components/DonationStatusBadge/DonationStatusBadge';

// The admin moves a donation forward one step at a time; completed is final.
const NEXT_STEP: Record<DonationStatus, { status: DonationStatus; label: string } | null> = {
  pending: { status: 'approved', label: 'Aprobar donación' },
  approved: { status: 'completed', label: 'Marcar como completada' },
  completed: null,
};

interface DonationCardProps {
  donation: Donation;
  onChangeStatus?: (status: DonationStatus) => void;
  busy?: boolean;
}

export const DonationCard = ({ donation, onChangeStatus, busy = false }: DonationCardProps) => {
  const nextStep = NEXT_STEP[donation.status];

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-sm font-semibold">
          {getInitials(donation.donorName)}
        </span>
        <div className="flex-1">
          <p className="font-semibold">{donation.donorName}</p>
          <p className="text-xs text-neutral-600">{donation.zone}</p>
        </div>
        <DonationStatusBadge status={donation.status} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-cream p-3">
          <p className="text-xs text-neutral-500">Alimentos para donar</p>
          <p className="font-semibold">{donation.items}</p>
        </div>
        <div className="rounded-xl bg-cream p-3">
          <p className="text-xs text-neutral-500">Fecha de vencimiento</p>
          <p className="font-semibold">{donation.expiresLabel}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button type="button" className="rounded-lg bg-brand shadow-glow-brand transition hover:-translate-y-0.5 py-2.5 text-sm font-semibold text-white">
          Contactar por WhatsApp
        </button>
        {!onChangeStatus ? null : nextStep ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onChangeStatus(nextStep.status)}
            className="rounded-lg border border-black/10 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Actualizando…' : nextStep.label}
          </button>
        ) : (
          <p className="flex items-center justify-center rounded-lg bg-brand-soft py-2.5 text-sm font-semibold text-brand-dark">
            Entrega completada
          </p>
        )}
      </div>
    </article>
  );
};

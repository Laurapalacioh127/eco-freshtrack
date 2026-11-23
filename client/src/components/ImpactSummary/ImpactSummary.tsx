import type { DonationSummary } from '@/types';
import { Photo } from '@/components/Photo/Photo';

export const ImpactSummary = ({ summary }: { summary: DonationSummary }) => (
  <aside className="relative overflow-hidden rounded-[2rem] bg-ops text-white shadow-pop">
    <Photo src="/photos/impact.jpg" sizes="(min-width: 1024px) 400px, 100vw" className="opacity-20" />
    <div className="relative flex flex-col gap-4 p-6">
      <p className="text-xs font-bold">Resumen de donaciones</p>
      <div>
        <p className="text-7xl font-extrabold tracking-tight">{summary.completedDonations}</p>
        <p className="text-sm">entregas completadas</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
          <p className="text-3xl font-extrabold">{summary.pendingDonations}</p>
          <p className="text-xs">pendientes</p>
        </div>
        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
          <p className="text-3xl font-extrabold">{summary.approvedDonations}</p>
          <p className="text-xs">aprobadas</p>
        </div>
        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
          <p className="text-3xl font-extrabold">{summary.totalDonations}</p>
          <p className="text-xs">en total</p>
        </div>
      </div>
    </div>
  </aside>
);

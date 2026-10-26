import type { DonationSummary } from '@/types';
import { formatKg } from '@/utils/format';

export const ImpactSummary = ({ summary }: { summary: DonationSummary }) => (
  <aside className="flex flex-col gap-4 rounded-3xl bg-ops p-6 text-white">
    <p className="text-xs">Hoy · Resumen de impacto</p>
    <div>
      <p className="text-6xl font-light">{formatKg(summary.kgRescued)}</p>
      <p className="text-sm">kg rescatados</p>
    </div>
    <div>
      <div className="flex justify-between text-xs">
        <span>Meta diaria</span>
        <span>{summary.dailyGoalPercent}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-white/20">
        <div className="h-1.5 rounded-full bg-white" style={{ width: `${summary.dailyGoalPercent}%` }} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-white/15 p-3">
        <p className="text-2xl font-semibold">{summary.families}</p>
        <p className="text-xs">familias</p>
      </div>
      <div className="rounded-xl bg-white/15 p-3">
        <p className="text-2xl font-semibold">{summary.deliveries}</p>
        <p className="text-xs">entregas</p>
      </div>
    </div>
  </aside>
);
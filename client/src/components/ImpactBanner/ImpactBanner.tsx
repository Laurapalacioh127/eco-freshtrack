import Link from 'next/link';
import { formatKg } from '@/utils/format';

interface ImpactBannerProps {
  kgSaved: number;
  points: number;
}

export const ImpactBanner = ({ kgSaved, points }: ImpactBannerProps) => (
  <section className="flex items-center justify-between rounded-3xl bg-brand p-8 text-white">
    <div>
      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Tu impacto</span>
      <h2 className="mt-4 text-3xl font-light">
        Has evitado <strong className="font-semibold">{formatKg(kgSaved)} kg</strong> de desperdicio
      </h2>
      <Link href="/user/recipes" className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold">
        Buscar receta
      </Link>
    </div>
    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full bg-sun text-ink">
      <span className="text-3xl font-semibold">{points}</span>
      <span className="text-xs">puntos</span>
    </div>
  </section>
);
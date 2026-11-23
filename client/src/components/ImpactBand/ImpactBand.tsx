import { Photo } from '@/components/Photo/Photo';

export const ImpactBand = () => (
  <section className="relative overflow-hidden bg-ink text-white">
    <Photo src="/photos/impact.jpg" sizes="100vw" className="opacity-40" />
    <div className="relative mx-auto max-w-6xl px-8 py-16">
      <p className="text-3xl font-extrabold text-sun">Menos desperdicio.</p>
      <p className="text-3xl font-extrabold">Más comunidad.</p>
    </div>
  </section>
);

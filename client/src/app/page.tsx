import { Logo } from '@/components/logo/Logo';
import { RoleCard } from '@/components/RoleCard/RoleCard';

const stats = [
  { value: '12.480', label: 'kg de comida salvada' },
  { value: '1.246', label: 'donaciones entregadas' },
  { value: '3.820', label: 'familias ayudadas' },
];

const HomePage = () => (
  <>
    <header className="flex items-center justify-between px-8 py-5">
      <Logo />
      <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium">
        Saber · Actuar · Planear
      </span>
    </header>

    <section className="px-8 py-16 md:px-16">
      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">
        Comida bien aprovechada
      </span>
      <h1 className="mt-6 text-6xl font-light leading-none md:text-7xl">
        Bienvenido
        <br />a <span className="text-brand">FreshTrack</span>
      </h1>
      <p className="mt-6 max-w-md text-neutral-600">
        Convierte el manejo de tu comida en una rutina simple y proactiva.
      </p>
      <p className="mt-6 text-sm font-semibold">Saber → Actuar → Planear</p>
    </section>

    <section className="bg-white px-8 py-16 text-center md:px-16">
      <p className="text-xs font-semibold tracking-widest text-brand">ELIGE TU EXPERIENCIA</p>
      <h2 className="mt-2 text-4xl font-light">¿Cómo quieres usar FreshTrack?</h2>
      <p className="mt-2 text-sm text-neutral-600">Un mismo propósito, dos herramientas conectadas.</p>
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        <RoleCard
          portal="user"
          tag="Para tu hogar"
          title="Quiero trackear mi comida"
          description="Controla tu inventario, evita el desperdicio y dona lo que no vas a consumir."
          href="/login/user"
          buttonLabel="Continuar como usuario"
        />
        <RoleCard
          portal="admin"
          tag="Para organizaciones"
          title="Quiero ser parte del equipo"
          description="Modera contenido, gestiona el catálogo y coordina donaciones."
          href="/login/admin"
          buttonLabel="Continuar como equipo"
        />
      </div>
    </section>

    <section className="grid items-center gap-6 bg-ink px-8 py-10 text-white md:grid-cols-4 md:px-16">
      <div>
        <p className="text-lg text-sun">Menos desperdicio.</p>
        <p className="font-semibold">Más comunidad.</p>
      </div>
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-2xl font-semibold">{stat.value}</p>
          <p className="text-xs text-white/60">{stat.label}</p>
        </div>
      ))}
    </section>
  </>
);

export default HomePage;
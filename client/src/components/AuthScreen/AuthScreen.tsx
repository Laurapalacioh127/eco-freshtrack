import Link from 'next/link';
import type { Portal } from '@/types';
import { portalTheme } from '@/utils/portalTheme';
import { Logo } from '@/components/logo/Logo';
import { AuthForm } from '@/components/AuthForm/AuthForm';

const copy: Record<Portal, { badge: string; title: string }> = {
  user: { badge: 'Cuenta personal', title: 'Ingresa a tu cuenta' },
  admin: { badge: 'Portal de operaciones', title: 'Acceso al equipo FreshTrack' },
};

export const AuthScreen = ({ portal }: { portal: Portal }) => {
  const theme = portalTheme[portal];

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-center gap-6 px-8 py-10 md:px-16">
        <Logo />
        <div className="flex items-center gap-3 text-xs">
          <Link href="/" className="font-semibold">← Cambiar de rol</Link>
          <span className={`rounded-full px-2 py-0.5 font-semibold ${theme.badge}`}>{copy[portal].badge}</span>
        </div>
        <h1 className="text-4xl font-light leading-tight">{copy[portal].title}</h1>
        <AuthForm portal={portal} />
      </section>

      <aside className={`hidden flex-col justify-end p-12 md:flex ${theme.card}`}>
        <p className="max-w-xs text-lg font-semibold">“Cada alimento aprovechado es una pequeña victoria.”</p>
        <p className="mt-2 text-xs text-neutral-600">Comunidad FreshTrack</p>
      </aside>
    </div>
  );
};
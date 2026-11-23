'use client';

import { useLogout } from '@/hooks/useLogout';
import { useDonations } from '@/providers/DonationsProvider';
import { useUsers } from '@/providers/UsersProvider';
import { Logo } from '@/components/logo/Logo';
import { SidebarLink } from '@/components/SidebarLink/SidebarLink';

const links = [
  { href: '/user', label: 'Inicio', exact: true },
  { href: '/user/inventory', label: 'Inventario' },
  { href: '/user/scan', label: 'Escanear' },
  { href: '/user/recipes', label: 'Recetas' },
  { href: '/user/profile', label: 'Perfil' },
];

export const UserSidebar = () => {
  const { me } = useUsers();
  const { summary } = useDonations();
  const handleLogout = useLogout('user');

  return (
    <aside className="m-4 flex w-56 shrink-0 flex-col gap-6 rounded-[2rem] bg-white p-5 shadow-soft">
      <Logo />
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <SidebarLink key={link.href} {...link} variant="light" />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <button type="button" onClick={handleLogout} className="px-3 text-left text-sm font-medium text-neutral-600">
          Cerrar sesión
        </button>
        {me && (
          <div className="rounded-xl bg-ink p-3 text-white">
            <p className="text-sm font-semibold">{summary?.completedDonations ?? 0} donaciones entregadas</p>
            <p className="text-xs text-white/70">¡Sigue así, {me.name.split(' ')[0]}!</p>
          </div>
        )}
      </div>
    </aside>
  );
};
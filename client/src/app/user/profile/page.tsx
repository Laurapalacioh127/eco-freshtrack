'use client';

import { useLogout } from '@/hooks/useLogout';
import { useDonations } from '@/providers/DonationsProvider';
import { useUsers } from '@/providers/UsersProvider';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ProfileCard } from '@/components/ProfileCard/ProfileCard';

const ProfilePage = () => {
  const { me, loading, error } = useUsers();
  const { summary } = useDonations();
  const handleLogout = useLogout('user');

  if (loading) return <p>Cargando tu perfil…</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;
  if (!me) return <p>No encontramos tu perfil.</p>;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <PageHeader eyebrow="TU CUENTA" title="Perfil" subtitle="Tu actividad e impacto en un solo lugar." />
      <ProfileCard user={me} summary={summary} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-rose-soft px-5 py-2.5 text-sm font-semibold text-rose-900"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

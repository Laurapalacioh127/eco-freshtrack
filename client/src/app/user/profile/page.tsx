'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { loginPathFor } from '@/utils/authStorage';
import { useUsers } from '@/providers/UsersProvider';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ProfileCard } from '@/components/ProfileCard/ProfileCard';

const ProfilePage = () => {
  const { me, loading, error } = useUsers();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace(loginPathFor('user'));
  };

  if (loading) return <p>Cargando tu perfil…</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;
  if (!me) return <p>No encontramos tu perfil.</p>;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <PageHeader eyebrow="TU CUENTA" title="Perfil" subtitle="Tu actividad e impacto en un solo lugar." />
      <ProfileCard user={me} />
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold"
        >
          Preferencias
        </button>
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

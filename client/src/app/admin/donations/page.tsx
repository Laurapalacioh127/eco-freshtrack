'use client';

import { useState } from 'react';
import { useDonations } from '@/providers/DonationsProvider';
import { useToast } from '@/providers/ToastProvider';
import type { DonationStatus } from '@/types';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SearchBox } from '@/components/SearchBox/SearchBox';
import { CategoryChips } from '@/components/CategoryChips/CategoryChips';
import { DonationCard } from '@/components/DonationCard/DonationCard';

const filters: { name: string; status: DonationStatus | null }[] = [
  { name: 'Todas', status: null },
  { name: 'Pendientes', status: 'pending' },
  { name: 'Aprobadas', status: 'approved' },
  { name: 'Completadas', status: 'completed' },
];

const AdminDonationsPage = () => {
  const { donations, loading, error, updateDonationStatus } = useDonations();
  const { showToast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  if (loading) return <p>Cargando donaciones…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const chips = filters.map((item) => ({
    name: item.name,
    count: item.status
      ? donations.filter((donation) => donation.status === item.status).length
      : donations.length,
  }));

  const activeStatus = filters.find((item) => item.name === filter)?.status ?? null;
  const visible = donations.filter(
    (donation) =>
      (!activeStatus || donation.status === activeStatus) &&
      `${donation.donorName} ${donation.zone}`.toLowerCase().includes(search.toLowerCase())
  );

  const changeStatus = async (id: string, status: DonationStatus) => {
    setBusyId(id);
    try {
      await updateDonationStatus(id, status);
      showToast('Estado de la donación actualizado', 'success');
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="LOGÍSTICA SOLIDARIA"
        title="Panel de donaciones"
        subtitle="Coordina ofertas, rutas y entregas en tiempo real."
        action={
          <button type="button" className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-5 py-2.5 text-sm font-semibold text-white">
            + Registrar donación
          </button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategoryChips categories={chips} selected={filter} onSelect={setFilter} />
        <div className="w-64">
          <SearchBox placeholder="Buscar por donante o zona" value={search} onChange={setSearch} />
        </div>
      </div>
      {donations.length === 0 ? (
        <EmptyState
          title="Aún no hay donaciones"
          description="Las nuevas donaciones aparecerán aquí en tiempo real."
        />
      ) : (
        visible.length === 0 && <EmptyState title="No hay donaciones que coincidan con tu búsqueda." />
      )}
      {visible.map((donation) => (
        <DonationCard
          key={donation.id}
          donation={donation}
          busy={busyId === donation.id}
          onChangeStatus={(status) => changeStatus(donation.id, status)}
        />
      ))}
    </div>
  );
};

export default AdminDonationsPage;
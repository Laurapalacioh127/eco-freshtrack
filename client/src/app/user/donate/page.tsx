'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDonations, type CreateDonationInput } from '@/providers/DonationsProvider';
import { useInventory } from '@/providers/InventoryProvider';
import { useToast } from '@/providers/ToastProvider';
import { DonationForm } from '@/components/DonationForm/DonationForm';

const DonatePage = () => {
  const router = useRouter();
  const { items, loading, error } = useInventory();
  const [submitting, setSubmitting] = useState(false);
  const { createDonation } = useDonations();
  const { showToast } = useToast();

  if (loading) return <p>Cargando tus alimentos…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const handleSubmit = async (input: CreateDonationInput) => {
    setSubmitting(true);
    try {
      const donation = await createDonation(input);
      showToast('¡Donación registrada! El equipo la revisará pronto', 'success');
      router.push(`/user/donate/status?id=${donation.id}`);
    } catch (err) {
      showToast((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-light">Donar alimentos</h1>
      <p className="text-sm text-neutral-600">Ayúdalos a llegar a una familia antes de que venzan.</p>
      <DonationForm
        inventoryItems={items}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/user/inventory')}
      />
    </div>
  );
};

export default DonatePage;

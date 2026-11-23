'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory, type AddInventoryItemInput } from '@/providers/InventoryProvider';
import { useToast } from '@/providers/ToastProvider';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { InventoryItemForm } from '@/components/InventoryItemForm/InventoryItemForm';

const ManualAddPage = () => {
  const router = useRouter();
  const { addItem } = useInventory();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (input: AddInventoryItemInput) => {
    setSubmitting(true);
    try {
      await addItem(input);
      showToast('Alimento agregado a tu inventario', 'success');
      router.push('/user/inventory');
    } catch (err) {
      showToast((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="REGISTRO MANUAL" title="Agregar alimento" />
      <InventoryItemForm submitting={submitting} onSubmit={handleSubmit} />
    </div>
  );
};

export default ManualAddPage;

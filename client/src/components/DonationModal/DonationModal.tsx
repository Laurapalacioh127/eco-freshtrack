'use client';

import { useState } from 'react';
import { useDonations, type CreateDonationInput } from '@/providers/DonationsProvider';
import { useToast } from '@/providers/ToastProvider';
import { DonationForm } from '@/components/DonationForm/DonationForm';

export const DonationModal = ({ onClose }: { onClose: () => void }) => {
  const { createDonation } = useDonations();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (input: CreateDonationInput) => {
    setSubmitting(true);
    try {
      await createDonation(input);
      showToast('Donación registrada', 'success');
      onClose();
    } catch (err) {
      showToast((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id="donation-modal-title" className="text-2xl font-light">
          Registrar donación
        </h2>
        <p className="text-sm text-neutral-600">Registra una donación recibida en persona.</p>
        <DonationForm requireDonorName submitting={submitting} onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </div>
  );
};

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { DonationModal } from '@/components/DonationModal/DonationModal';
import { ToastProvider } from '@/providers/ToastProvider';

const createDonation = vi.fn();
vi.mock('@/providers/DonationsProvider', () => ({ useDonations: () => ({ createDonation }) }));

beforeEach(() => {
  createDonation.mockReset();
});

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Nombre del donante'), 'Ana');
  await user.type(screen.getByLabelText('Otros alimentos'), 'Arroz{Enter}');
  await user.type(screen.getByLabelText('Lugar de recogida'), 'Cali');
  await user.click(screen.getByRole('button', { name: 'Confirmar donación ♡' }));
};

test('submits the donation with the donor name, shows the toast and closes', async () => {
  createDonation.mockResolvedValue({});
  const onClose = vi.fn();
  const user = userEvent.setup();
  render(<ToastProvider><DonationModal onClose={onClose} /></ToastProvider>);

  await fill(user);

  expect(createDonation).toHaveBeenCalledWith({ zone: 'Cali', items: 'Arroz', donorName: 'Ana' });
  expect(await screen.findByText('Donación registrada')).toBeInTheDocument();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('shows the error toast and stays open when the request fails', async () => {
  createDonation.mockImplementation(async () => {
    throw new Error('No se pudo registrar');
  });
  const onClose = vi.fn();
  const user = userEvent.setup();
  render(<ToastProvider><DonationModal onClose={onClose} /></ToastProvider>);

  await fill(user);

  expect(await screen.findByText('No se pudo registrar')).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
});

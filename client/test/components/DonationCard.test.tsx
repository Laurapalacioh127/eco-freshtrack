import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { DonationCard } from '@/components/DonationCard/DonationCard';
import type { Donation, DonationStatus } from '@/types';

const makeDonation = (status: DonationStatus): Donation => ({
  id: 'd1',
  donorName: 'Ana Pérez',
  zone: 'Norte',
  items: '3 kg de arroz',
  expiresLabel: '10 dic',
  status,
});

test('pending donation has no WhatsApp button', () => {
  render(<DonationCard donation={makeDonation('pending')} onChangeStatus={vi.fn()} />);

  expect(screen.queryByRole('button', { name: /whatsapp/i })).not.toBeInTheDocument();
});

test('pending donation advances to approved', async () => {
  const user = userEvent.setup();
  const onChangeStatus = vi.fn();
  render(<DonationCard donation={makeDonation('pending')} onChangeStatus={onChangeStatus} />);

  await user.click(screen.getByRole('button', { name: 'Aprobar donación' }));

  expect(onChangeStatus).toHaveBeenCalledWith('approved');
});

test('approved donation advances to completed', async () => {
  const user = userEvent.setup();
  const onChangeStatus = vi.fn();
  render(<DonationCard donation={makeDonation('approved')} onChangeStatus={onChangeStatus} />);

  await user.click(screen.getByRole('button', { name: 'Marcar como completada' }));

  expect(onChangeStatus).toHaveBeenCalledWith('completed');
});

test('completed donation shows "Entrega completada"', () => {
  render(<DonationCard donation={makeDonation('completed')} onChangeStatus={vi.fn()} />);

  expect(screen.getByText('Entrega completada')).toBeInTheDocument();
});

test('completed donation renders no buttons', () => {
  render(<DonationCard donation={makeDonation('completed')} onChangeStatus={vi.fn()} />);

  expect(screen.queryAllByRole('button')).toHaveLength(0);
});

test('busy donation shows a disabled "Actualizando…" button', () => {
  render(<DonationCard donation={makeDonation('pending')} onChangeStatus={vi.fn()} busy />);

  expect(screen.getByRole('button', { name: 'Actualizando…' })).toBeDisabled();
});

test('donation without onChangeStatus renders no buttons', () => {
  render(<DonationCard donation={makeDonation('pending')} />);

  expect(screen.queryAllByRole('button')).toHaveLength(0);
});

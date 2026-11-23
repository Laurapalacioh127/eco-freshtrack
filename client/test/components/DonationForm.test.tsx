import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { DonationForm } from '@/components/DonationForm/DonationForm';
import type { InventoryItem } from '@/types';

const ok: InventoryItem = { id: 'i1', name: 'Pan', category: 'Panadería', quantity: '2', expiresInDays: 2, status: 'soon' };
const expired: InventoryItem = { id: 'i2', name: 'Yogur', category: 'Lácteos', quantity: '1', expiresInDays: -1, status: 'expired' };
const submitButton = () => screen.getByRole('button', { name: 'Confirmar donación ♡' });

test('lists a non-expired item as pickable', () => {
  render(<DonationForm inventoryItems={[ok]} submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);

  expect(screen.getByRole('checkbox', { name: 'Donar Pan' })).toBeInTheDocument();
});

test('does not list an expired item', () => {
  render(<DonationForm inventoryItems={[ok, expired]} submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);

  expect(screen.queryByRole('checkbox', { name: 'Donar Yogur' })).not.toBeInTheDocument();
});

test('submits a picked item with its expiry label', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<DonationForm inventoryItems={[ok]} submitting={false} onSubmit={onSubmit} onCancel={vi.fn()} />);

  await user.click(screen.getByRole('checkbox', { name: 'Donar Pan' }));
  await user.type(screen.getByLabelText('Lugar de recogida'), 'Cali');
  await user.click(submitButton());

  expect(onSubmit).toHaveBeenCalledWith({ zone: 'Cali', items: 'Pan (2)', expiresLabel: '2 días' });
});

test('submits only named items without an expiresLabel', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<DonationForm submitting={false} onSubmit={onSubmit} onCancel={vi.fn()} />);

  await user.type(screen.getByLabelText('Otros alimentos'), 'Arroz{Enter}');
  await user.type(screen.getByLabelText('Lugar de recogida'), 'Cali');
  await user.click(submitButton());

  expect(onSubmit).toHaveBeenCalledWith({ zone: 'Cali', items: 'Arroz' });
});

test('shows the validation error and does not submit an empty form', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<DonationForm submitting={false} onSubmit={onSubmit} onCancel={vi.fn()} />);

  await user.click(submitButton());

  expect(screen.getByText('Elige o escribe al menos un alimento')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('shows the donor name field when requireDonorName is set', () => {
  render(<DonationForm requireDonorName submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);

  expect(screen.getByLabelText('Nombre del donante')).toBeInTheDocument();
});

test('hides the donor name field by default', () => {
  render(<DonationForm submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);

  expect(screen.queryByLabelText('Nombre del donante')).not.toBeInTheDocument();
});

test('calls onCancel when clicking Cancelar', async () => {
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(<DonationForm submitting={false} onSubmit={vi.fn()} onCancel={onCancel} />);

  await user.click(screen.getByRole('button', { name: 'Cancelar' }));

  expect(onCancel).toHaveBeenCalledTimes(1);
});

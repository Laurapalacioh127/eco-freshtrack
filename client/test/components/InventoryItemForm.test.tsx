import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { InventoryItemForm } from '@/components/InventoryItemForm/InventoryItemForm';

test('shows the name error when submitting an empty form', async () => {
  const user = userEvent.setup();
  render(<InventoryItemForm submitting={false} onSubmit={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: 'Guardar en inventario ✓' }));

  expect(screen.getByText('Escribe el nombre del alimento')).toBeInTheDocument();
});

test('does not call onSubmit when the form is empty', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<InventoryItemForm submitting={false} onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: 'Guardar en inventario ✓' }));

  expect(onSubmit).not.toHaveBeenCalled();
});

test('calls onSubmit with the values when the form is filled', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<InventoryItemForm submitting={false} onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Nombre del alimento'), 'Leche');
  await user.type(screen.getByLabelText('Categoría'), 'Lácteos');
  await user.type(screen.getByLabelText('Cantidad'), '1 L');
  await user.type(screen.getByLabelText('Fecha de vencimiento'), '2030-01-15');
  await user.click(screen.getByRole('button', { name: 'Guardar en inventario ✓' }));

  expect(onSubmit).toHaveBeenCalledWith({ name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresOn: '2030-01-15' });
});

test('disables the button and shows Guardando while submitting', () => {
  render(<InventoryItemForm submitting onSubmit={vi.fn()} />);

  expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
});

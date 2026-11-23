import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { ManualBarcodeForm } from '@/components/ManualBarcodeForm/ManualBarcodeForm';

test('shows an error and does not submit an invalid code', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<ManualBarcodeForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Código de barras'), '123');
  await user.click(screen.getByRole('button', { name: 'Buscar producto' }));

  expect(screen.getByText('Ingresa un código de 8 a 14 dígitos')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('submits a valid code', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<ManualBarcodeForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Código de barras'), '7702001043276');
  await user.click(screen.getByRole('button', { name: 'Buscar producto' }));

  expect(onSubmit).toHaveBeenCalledWith('7702001043276');
});

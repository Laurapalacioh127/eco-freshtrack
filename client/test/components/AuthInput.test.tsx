import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AuthInput } from '@/components/AuthInput/AuthInput';

test('shows the error with role alert', () => {
  render(<AuthInput label="Correo" placeholder="x" value="" onChange={vi.fn()} error="Ingresa un correo válido" />);

  expect(screen.getByRole('alert')).toHaveTextContent('Ingresa un correo válido');
});

test('renders no alert without an error', () => {
  render(<AuthInput label="Correo" placeholder="x" value="" onChange={vi.fn()} />);

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

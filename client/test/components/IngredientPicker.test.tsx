import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { IngredientPicker } from '@/components/IngredientPicker/IngredientPicker';

test('explains how to get ingredients when there are no options', () => {
  render(<IngredientPicker options={[]} selected={[]} onToggle={vi.fn()} />);

  expect(screen.getByText('Agrega alimentos a tu inventario para elegirlos como ingredientes.')).toBeInTheDocument();
});

test('shows the error with role alert', () => {
  render(<IngredientPicker options={['Papa']} selected={[]} onToggle={vi.fn()} error="Elige al menos un ingrediente" />);

  expect(screen.getByRole('alert')).toHaveTextContent('Elige al menos un ingrediente');
});

test('disables the option buttons', () => {
  render(<IngredientPicker options={['Papa']} selected={[]} onToggle={vi.fn()} disabled />);

  expect(screen.getByRole('button', { name: 'Papa' })).toBeDisabled();
});

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { EmptyState } from '@/components/EmptyState/EmptyState';

test('shows the title', () => {
  render(<EmptyState title="Tu inventario está vacío" />);

  expect(screen.getByRole('status')).toHaveTextContent('Tu inventario está vacío');
});

test('renders the action link with its href', () => {
  render(<EmptyState title="Vacío" actionHref="/user/scan" actionLabel="+ Agregar alimento" />);

  expect(screen.getByRole('link', { name: '+ Agregar alimento' })).toHaveAttribute('href', '/user/scan');
});

test('renders no link without action props', () => {
  render(<EmptyState title="Vacío" />);

  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('renders no link when only the href is given', () => {
  render(<EmptyState title="Vacío" actionHref="/user/scan" />);

  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

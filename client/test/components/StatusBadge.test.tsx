import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';

test('shows "Vence mañana" for an item expiring in one day', () => {
  render(<StatusBadge status="soon" expiresInDays={1} />);
  expect(screen.getByText('Vence mañana')).toBeInTheDocument();
});

test('shows "Vence hoy" for an item expiring today', () => {
  render(<StatusBadge status="ok" expiresInDays={0} />);
  expect(screen.getByText('Vence hoy')).toBeInTheDocument();
});

test('shows "Vencido" for an expired item', () => {
  render(<StatusBadge status="expired" expiresInDays={-2} />);
  expect(screen.getByText('Vencido')).toBeInTheDocument();
});

test('shows the day count for an item with days left', () => {
  render(<StatusBadge status="ok" expiresInDays={5} />);
  expect(screen.getByText('5 días')).toBeInTheDocument();
});

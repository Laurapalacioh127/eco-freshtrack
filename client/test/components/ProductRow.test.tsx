import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ProductRow } from '@/components/ProductRow/ProductRow';
import type { Product } from '@/types';

const product: Product = {
  id: 'p1',
  name: 'Leche entera',
  category: 'Lácteos',
  shelfLifeDays: 7,
  substitutes: ['Leche de soya'],
};

const renderRow = () =>
  render(
    <table>
      <tbody>
        <ProductRow product={product} />
      </tbody>
    </table>,
  );

test('ProductRow shows name, category and shelf life days', () => {
  renderRow();

  expect(screen.getByText('Leche entera')).toBeInTheDocument();
  expect(screen.getByText('Lácteos')).toBeInTheDocument();
  expect(screen.getByText('7 días')).toBeInTheDocument();
});

test('ProductRow has no "Editar" button', () => {
  renderRow();

  expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
});

test('ProductRow renders exactly four cells', () => {
  renderRow();

  expect(screen.getAllByRole('cell')).toHaveLength(4);
});

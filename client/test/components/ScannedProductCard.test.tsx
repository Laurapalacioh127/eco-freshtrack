import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ScannedProductCard } from '@/components/ScannedProductCard/ScannedProductCard';

const base = { code: '7702001043276', name: 'Leche entera', category: 'Lácteos', imageUrl: null };

test('renders the product name', () => {
  render(<ScannedProductCard product={base} />);

  expect(screen.getByText('Leche entera')).toBeInTheDocument();
});

test('shows Sin categoría when the category is empty', () => {
  render(<ScannedProductCard product={{ ...base, category: '' }} />);

  expect(screen.getByText('Sin categoría')).toBeInTheDocument();
});

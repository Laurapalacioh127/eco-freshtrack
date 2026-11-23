import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import AdminCatalogPage from '@/app/admin/catalog/page';

vi.mock('@/providers/ProductsProvider', () => ({
  useProducts: () => ({ products: [], loading: false, error: null, createProduct: vi.fn() }),
}));
vi.mock('@/providers/ToastProvider', () => ({ useToast: () => ({ showToast: vi.fn() }) }));

test('catalog table has no ACCIONES column header', () => {
  render(<AdminCatalogPage />);

  expect(screen.queryByRole('columnheader', { name: 'ACCIONES' })).not.toBeInTheDocument();
});

test('catalog table has four column headers', () => {
  render(<AdminCatalogPage />);

  expect(screen.getAllByRole('columnheader')).toHaveLength(4);
});

test('empty catalog cell spans four columns', () => {
  render(<AdminCatalogPage />);

  const cell = screen.getByText('El catálogo está vacío').closest('td');

  expect(cell).toHaveAttribute('colspan', '4');
});

test('"+ Nuevo producto maestro" opens the modal', async () => {
  const user = userEvent.setup();
  render(<AdminCatalogPage />);

  await user.click(screen.getByRole('button', { name: '+ Nuevo producto maestro' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

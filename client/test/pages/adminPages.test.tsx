import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import AdminCatalogPage from '@/app/admin/catalog/page';
import AdminDonationsPage from '@/app/admin/donations/page';

vi.mock('@/providers/DonationsProvider', () => ({
  useDonations: () => ({
    donations: [], loading: false, error: null, createDonation: vi.fn(), updateDonationStatus: vi.fn(),
  }),
}));
vi.mock('@/providers/ProductsProvider', () => ({
  useProducts: () => ({ products: [], loading: false, error: null, createProduct: vi.fn() }),
}));
vi.mock('@/providers/ToastProvider', () => ({ useToast: () => ({ showToast: vi.fn() }) }));

test('admin donations page opens the donation dialog with the donor name field', async () => {
  const user = userEvent.setup();
  render(<AdminDonationsPage />);

  await user.click(screen.getByRole('button', { name: '+ Registrar donación' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByLabelText('Nombre del donante')).toBeInTheDocument();
});

test('admin catalog page no longer offers "Editar reglas de vencimiento"', () => {
  render(<AdminCatalogPage />);

  expect(screen.queryByText('Editar reglas de vencimiento')).not.toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { NewProductModal } from '@/components/NewProductModal/NewProductModal';
import { ProductsProvider, useProducts } from '@/providers/ProductsProvider';
import { ToastProvider } from '@/providers/ToastProvider';

const get = vi.fn();
const post = vi.fn();
const axiosMock = { get, post };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));

const Names = () => {
  const { products } = useProducts();
  return <ul aria-label="catalogo">{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
};

const renderModal = () => {
  const onClose = vi.fn();
  render(
    <ToastProvider>
      <ProductsProvider>
        <Names />
        <NewProductModal onClose={onClose} />
      </ProductsProvider>
    </ToastProvider>,
  );
  return onClose;
};

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Nombre'), 'Kiwi');
  await user.selectOptions(screen.getByLabelText('Categoría'), 'Frutas');
  await user.type(screen.getByLabelText('Días de vida útil'), '10');
  await user.type(screen.getByLabelText('Sustitutos'), 'Fresa{Enter}');
};

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  get.mockResolvedValue({ data: [] });
});

test('renders as a dialog', () => {
  renderModal();

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('posts the product to /api/products', async () => {
  post.mockResolvedValue({ data: { id: 'p1', name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: ['Fresa'] } });
  const user = userEvent.setup();
  renderModal();

  await fill(user);
  await user.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(post).toHaveBeenCalledWith('/api/products', {
    name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: ['Fresa'],
  });
});

test('adds the product to the catalog and closes on success', async () => {
  post.mockResolvedValue({ data: { id: 'p1', name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: [] } });
  const user = userEvent.setup();
  const onClose = renderModal();

  await fill(user);
  await user.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(await screen.findByText('Producto agregado al catálogo')).toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'catalogo' })).toHaveTextContent('Kiwi');
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('shows the server message and stays open when the request fails', async () => {
  post.mockRejectedValue(new Error('El campo "categoría" no es válido'));
  const user = userEvent.setup();
  const onClose = renderModal();

  await fill(user);
  await user.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(await screen.findByText('El campo "categoría" no es válido')).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
});

test('shows validation errors and does not post an empty form', async () => {
  const user = userEvent.setup();
  renderModal();

  await user.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(screen.getByText('Escribe el nombre del producto')).toBeInTheDocument();
  expect(post).not.toHaveBeenCalled();
});

test('calls onClose when clicking Cancelar', async () => {
  const user = userEvent.setup();
  const onClose = renderModal();

  await user.click(screen.getByRole('button', { name: 'Cancelar' }));

  expect(onClose).toHaveBeenCalledTimes(1);
});

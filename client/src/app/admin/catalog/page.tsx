'use client';

import { useProducts } from '@/providers/ProductsProvider';
import { ProductRow } from '@/components/ProductRow/ProductRow';

const AdminCatalogPage = () => {
  const { products, loading, error } = useProducts();

  if (loading) return <p className="p-8">Cargando catálogo…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Catálogo maestro</h1>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Vida útil</th>
            <th>Sustitutos</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default AdminCatalogPage;
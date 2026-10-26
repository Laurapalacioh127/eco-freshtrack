import type { Product } from '@/types';

export const ProductRow = ({ product }: { product: Product }) => (
  <tr className="border-b">
    <td className="py-3 font-medium">{product.name}</td>
    <td>{product.category}</td>
    <td>{product.shelfLifeDays} días</td>
    <td>{product.substitutes.join(', ')}</td>
  </tr>
);
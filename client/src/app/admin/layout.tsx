import { ProductsProvider } from '@/providers/ProductsProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProductsProvider>{children}</ProductsProvider>;
}
import { ProductCategory } from '../../utils/categories';

export interface Product {
  id: string;
  name: string;
  category: string;
  shelfLifeDays: number;
  substitutes: string[];
}

export type CreateProductDTO = Omit<Product, 'id' | 'category'> & { category: ProductCategory };

export interface Product {
  id: string;
  name: string;
  category: string;
  shelfLifeDays: number;
  substitutes: string[];
}

export type CreateProductDTO = Omit<Product, 'id'>;

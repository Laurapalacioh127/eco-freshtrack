import { Product } from './product.types';
import { productsMock } from './data.mock';

export const findAllProductsRepository = async (): Promise<Product[]> => {
  return productsMock;
};

export const findProductByIdRepository = async (
  id: string
): Promise<Product | undefined> => {
  return productsMock.find((product) => product.id === id);
};
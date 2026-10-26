import Boom from '@hapi/boom';
import { Product } from './product.types';
import {
  findAllProductsRepository,
  findProductByIdRepository,
} from './product.repository';

export const getProductsService = async (category?: string): Promise<Product[]> => {
  const products = await findAllProductsRepository();
  return category
    ? products.filter((product) => product.category === category)
    : products;
};

export const getProductByIdService = async (id: string): Promise<Product> => {
  const product = await findProductByIdRepository(id);

  if (!product) {
    throw Boom.notFound('Product not found');
  }

  return product;
};
import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import { CreateProductDTO, Product } from './product.types';
import {
  createProductRepository,
  findAllProductsRepository,
  findProductByIdRepository,
} from './product.repository';

export const getProductsService = async (category?: string): Promise<Product[]> => {
  return findAllProductsRepository(category);
};

export const getProductByIdService = async (id: string): Promise<Product> => {
  const product = isUuid(id) ? await findProductByIdRepository(id) : undefined;

  if (!product) {
    throw Boom.notFound('Product not found');
  }

  return product;
};

export const createProductService = async (data: CreateProductDTO): Promise<Product> => {
  return createProductRepository(data);
};

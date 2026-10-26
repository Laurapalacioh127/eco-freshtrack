import { Product } from './product.types';

export const productsMock: Product[] = [
  { id: '1', name: 'Tomate cherry', category: 'Verduras', shelfLifeDays: 7, substitutes: ['Tomate', 'Pimentón'] },
  { id: '2', name: 'Yogur griego', category: 'Lácteos', shelfLifeDays: 14, substitutes: ['Kéfir', 'Yogur natural'] },
  { id: '3', name: 'Garbanzos', category: 'Enlatados', shelfLifeDays: 720, substitutes: ['Lentejas', 'Frijoles'] },
  { id: '4', name: 'Fresas', category: 'Frutas', shelfLifeDays: 5, substitutes: ['Moras', 'Frambuesas'] },
];
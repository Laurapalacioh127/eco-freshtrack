import { InventoryItemData, ShoppingItem } from './inventory.types';

export const inventoryMock: InventoryItemData[] = [
  { id: '1', name: 'Fresas', category: 'Frutas', quantity: '1 bandeja', expiresInDays: 1 },
  { id: '2', name: 'Tomates cherry', category: 'Verduras', quantity: '350 g', expiresInDays: 3 },
  { id: '3', name: 'Espinaca', category: 'Verduras', quantity: '200 g', expiresInDays: 2 },
  { id: '4', name: 'Yogur griego', category: 'Lácteos', quantity: '2 unidades', expiresInDays: 5 },
  { id: '5', name: 'Leche entera', category: 'Lácteos', quantity: '1 litro', expiresInDays: -1 },
  { id: '6', name: 'Garbanzos', category: 'Enlatados', quantity: '2 latas', expiresInDays: 300 },
  { id: '7', name: 'Arroz', category: 'Despensa', quantity: '1 kg', expiresInDays: 180 },
];

export const shoppingListMock: ShoppingItem[] = [
  { id: 's1', name: 'Leche entera', quantity: '2 litros', reason: 'Queda poco: 1 unidad', checked: false },
  { id: 's2', name: 'Tomates cherry', quantity: '500 g', reason: 'Consumo semanal habitual', checked: false },
  { id: 's3', name: 'Fresas', quantity: '1 bandeja', reason: 'Sueles comprar cada 7 días', checked: true },
  { id: 's4', name: 'Yogur griego', quantity: '4 unidades', reason: 'Queda poco: 1 unidad', checked: false },
];
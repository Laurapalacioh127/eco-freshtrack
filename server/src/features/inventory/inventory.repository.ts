import { InventoryItemData, ShoppingItem } from './inventory.types';
import { inventoryMock, shoppingListMock } from './data.mock';

export const findAllInventoryRepository = async (): Promise<InventoryItemData[]> => {
  return inventoryMock;
};

export const findInventoryByIdRepository = async (
  id: string
): Promise<InventoryItemData | undefined> => {
  return inventoryMock.find((item) => item.id === id);
};

export const findShoppingListRepository = async (): Promise<ShoppingItem[]> => {
  return shoppingListMock;
};
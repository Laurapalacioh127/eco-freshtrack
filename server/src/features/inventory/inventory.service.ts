//aquí vive la regla de negocio: calcular el estado según los días
import Boom from '@hapi/boom';
import {
  InventoryItem,
  InventoryItemData,
  InventoryStatus,
  InventorySummary,
  ShoppingItem,
} from './inventory.types';
import {
  findAllInventoryRepository,
  findInventoryByIdRepository,
  findShoppingListRepository,
} from './inventory.repository';

const SOON_THRESHOLD_DAYS = 3;

const getStatus = (expiresInDays: number): InventoryStatus => {
  if (expiresInDays < 0) return 'expired';
  if (expiresInDays <= SOON_THRESHOLD_DAYS) return 'soon';
  return 'ok';
};

const withStatus = (item: InventoryItemData): InventoryItem => ({
  ...item,
  status: getStatus(item.expiresInDays),
});

export const getInventoryService = async (category?: string): Promise<InventoryItem[]> => {
  const items = (await findAllInventoryRepository()).map(withStatus);
  return category ? items.filter((item) => item.category === category) : items;
};

export const getInventoryByIdService = async (id: string): Promise<InventoryItem> => {
  const item = await findInventoryByIdRepository(id);

  if (!item) {
    throw Boom.notFound('Inventory item not found');
  }

  return withStatus(item);
};

export const getInventorySummaryService = async (): Promise<InventorySummary> => {
  const items = (await findAllInventoryRepository()).map(withStatus);

  return {
    registered: items.length,
    expiringSoon: items.filter((item) => item.status === 'soon').length,
    expired: items.filter((item) => item.status === 'expired').length,
  };
};

export const getShoppingListService = async (): Promise<ShoppingItem[]> => {
  return findShoppingListRepository();
};
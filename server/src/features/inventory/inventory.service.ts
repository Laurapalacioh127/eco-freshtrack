//aquí vive la regla de negocio: calcular el estado según los días
import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import {
  CreateInventoryItemDTO,
  InventoryItem,
  InventoryItemData,
  InventoryStatus,
  InventorySummary,
  ShoppingItem,
} from './inventory.types';
import {
  createInventoryItemRepository,
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

export const createInventoryItemService = async (
  item: CreateInventoryItemDTO,
): Promise<InventoryItem> => {
  return withStatus(await createInventoryItemRepository(item));
};

export const getInventoryService = async (
  userId: string,
  category?: string,
): Promise<InventoryItem[]> => {
  return (await findAllInventoryRepository(userId, category)).map(withStatus);
};

export const getInventoryByIdService = async (userId: string, id: string): Promise<InventoryItem> => {
  const item = isUuid(id) ? await findInventoryByIdRepository(userId, id) : undefined;

  if (!item) {
    throw Boom.notFound('Inventory item not found');
  }

  return withStatus(item);
};

export const getInventorySummaryService = async (userId: string): Promise<InventorySummary> => {
  const items = (await findAllInventoryRepository(userId)).map(withStatus);

  return {
    registered: items.length,
    expiringSoon: items.filter((item) => item.status === 'soon').length,
    expired: items.filter((item) => item.status === 'expired').length,
  };
};

export const getShoppingListService = async (userId: string): Promise<ShoppingItem[]> => {
  return findShoppingListRepository(userId);
};
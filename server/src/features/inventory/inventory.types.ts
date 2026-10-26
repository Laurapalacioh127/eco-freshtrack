export type InventoryStatus = 'ok' | 'soon' | 'expired';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiresInDays: number;
  status: InventoryStatus;
}

export type InventoryItemData = Omit<InventoryItem, 'status'>;

export interface InventorySummary {
  registered: number;
  expiringSoon: number;
  expired: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  reason: string;
  checked: boolean;
}
export type Portal = 'user' | 'admin';

export const PRODUCT_CATEGORIES = [
  'Frutas',
  'Verduras',
  'Lácteos',
  'Carnes',
  'Panadería',
  'Granos',
  'Bebidas',
  'Congelados',
  'Otros',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  category: string;
  shelfLifeDays: number;
  substitutes: string[];
}

export type InventoryStatus = 'ok' | 'soon' | 'expired';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiresInDays: number;
  status: InventoryStatus;
}

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

export type RecipeStatus = 'pending' | 'approved' | 'rejected';

export interface Recipe {
  id: string;
  title: string;
  author: string;
  minutes: number;
  difficulty: string;
  servings: number;
  ingredientsAvailable: number;
  ingredientsTotal: number;
  status: RecipeStatus;
  ingredients: string[];
  steps: string[];
}

export type DonationStatus = 'pending' | 'approved' | 'completed';

export interface Donation {
  id: string;
  donorName: string;
  zone: string;
  items: string;
  expiresLabel: string;
  status: DonationStatus;
}

export interface DonationSummary {
  totalDonations: number;
  pendingDonations: number;
  approvedDonations: number;
  completedDonations: number;
}

export type UserRole = 'household' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Mirrors the server's AuthSession (POST /api/auth/login | register | refresh).
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  // Empty strings after register when email confirmation is on (no session yet)
  accessToken: string;
  refreshToken: string;
  // Unix seconds, null when there is no session
  expiresAt: number | null;
}

export interface ScannedProduct {
  code: string;
  name: string;
  category: string;
  imageUrl: string | null;
}

export type NotificationType =
  | 'recipe-submitted'
  | 'recipe-reviewed'
  | 'donation-created'
  | 'donation-status-changed';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export const NOTIFICATION_TYPES = [
  'recipe-submitted',
  'recipe-reviewed',
  'donation-created',
  'donation-status-changed',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CreatedNotification {
  id: string;
  userId: string;
}

import Boom from '@hapi/boom';
import { broadcast, REALTIME } from '../../config/realtime';
import { isUuid } from '../../utils/isUuid';
import { CreatedNotification, Notification, NotificationType } from './notification.types';
import {
  createNotificationForDonationOwnerRepository,
  createNotificationForRecipeAuthorRepository,
  createNotificationsForRoleRepository,
  findNotificationsByUserRepository,
  markNotificationAsReadRepository,
} from './notification.repository';

export const getNotificationsService = async (userId: string): Promise<Notification[]> => {
  return findNotificationsByUserRepository(userId);
};

export const markNotificationAsReadService = async (
  userId: string,
  id: string,
): Promise<Notification> => {
  const notification = isUuid(id) ? await markNotificationAsReadRepository(userId, id) : undefined;

  if (!notification) {
    throw Boom.notFound('Notification not found');
  }

  return notification;
};

const broadcastCreated = (created: CreatedNotification[]): void => {
  for (const { id, userId } of created) {
    void broadcast(REALTIME.notifications.channel, REALTIME.notifications.created, { id, userId });
  }
};

// Notify helpers never throw: a failed notification must not fail the main action.
export const notifyRoleService = async (
  role: string,
  type: NotificationType,
  message: string,
): Promise<void> => {
  try {
    broadcastCreated(await createNotificationsForRoleRepository(role, type, message));
  } catch (error) {
    console.error('Failed to create notifications for role', error);
  }
};

export const notifyRecipeAuthorService = async (
  recipeId: string,
  type: NotificationType,
  message: string,
): Promise<void> => {
  try {
    const created = await createNotificationForRecipeAuthorRepository(recipeId, type, message);
    broadcastCreated(created ? [created] : []);
  } catch (error) {
    console.error('Failed to create notification for recipe author', error);
  }
};

export const notifyDonationOwnerService = async (
  donationId: string,
  type: NotificationType,
  message: string,
): Promise<void> => {
  try {
    const created = await createNotificationForDonationOwnerRepository(donationId, type, message);
    broadcastCreated(created ? [created] : []);
  } catch (error) {
    console.error('Failed to create notification for donation owner', error);
  }
};

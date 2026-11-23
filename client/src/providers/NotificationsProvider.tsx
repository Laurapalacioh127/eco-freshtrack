'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAxios } from './AxiosProvider';
import { useAuth } from './AuthProvider';
import type { Notification } from '@/types';
import { REALTIME, subscribeToBroadcast } from '@/utils/realtime';
import { hasId, upsertById } from '@/utils/upsertById';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const sortNewestFirst = (list: Notification[]): Notification[] =>
  [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const knownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    knownIds.current = new Set(notifications.map((n) => n.id));
  }, [notifications]);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    const fetchAndMerge = async () => {
      const res = await axios.get<Notification[]>('/api/notifications');
      if (!active) return;
      // Merge instead of replace: an event may have arrived before the response.
      setNotifications((prev) => sortNewestFirst(res.data.reduce(upsertById, prev)));
    };

    // The channel is public and carries no message, so the API is the source of truth.
    const handleCreated = async (payload: unknown) => {
      if (!hasId(payload)) return;
      if ((payload as { userId?: unknown }).userId !== userId) return;
      if (knownIds.current.has(payload.id)) return;

      try {
        await fetchAndMerge();
      } catch {
        // Keep the current list: a failed background refresh is not worth an error state.
      }
    };

    const unsubscribe = subscribeToBroadcast(REALTIME.notifications.channel, {
      [REALTIME.notifications.created]: handleCreated,
    });

    const onInit = async () => {
      try {
        await fetchAndMerge();
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    };

    onInit();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [axios, userId]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (notifications.find((n) => n.id === id)?.read) return;
      const res = await axios.patch<Notification>(`/api/notifications/${id}/read`);
      setNotifications((prev) => upsertById(prev, res.data));
    },
    [axios, notifications],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, error, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};

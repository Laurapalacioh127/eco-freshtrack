import { getSupabaseBrowser } from '@/utils/supabase';

// Realtime contract shared with the server (server/src/config/realtime.ts).
export const REALTIME = {
  donations: {
    channel: 'donations',
    created: 'donation-created',
    statusChanged: 'donation-status-changed',
  },
  recipes: {
    channel: 'recipes',
    submitted: 'recipe-submitted',
    reviewed: 'recipe-reviewed',
  },
} as const;

export type BroadcastHandlers = Record<string, (payload: unknown) => void>;

// Subscribes to Supabase Broadcast events on one channel and returns the cleanup,
// which providers must call on unmount so handlers are never registered twice.
export const subscribeToBroadcast = (channelName: string, handlers: BroadcastHandlers): (() => void) => {
  const supabase = getSupabaseBrowser();

  if (!supabase) {
    return () => {};
  }

  const channel = supabase.channel(channelName);

  Object.entries(handlers).forEach(([event, handler]) => {
    channel.on('broadcast', { event }, ({ payload }) => handler(payload));
  });

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};

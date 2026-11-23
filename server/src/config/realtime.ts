import { getSupabaseAdmin } from './supabase';

// Realtime contract (Supabase Broadcast). Payloads equal the REST response shape.
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

// Fire-and-forget: callers do not await it, and a failed broadcast (including a
// missing Supabase config) is logged and never fails the HTTP request.
export const broadcast = async (channelName: string, event: string, payload: object): Promise<void> => {
  try {
    const supabase = getSupabaseAdmin();
    const channel = supabase.channel(channelName);

    try {
      const result = await channel.httpSend(event, payload);

      if (!result.success) {
        console.error(`Failed to broadcast ${event} on ${channelName}: ${result.status} ${result.error}`);
      }
    } finally {
      await supabase.removeChannel(channel);
    }
  } catch (error) {
    console.error(`Failed to broadcast ${event} on ${channelName}`, error);
  }
};

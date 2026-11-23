// Idempotent insert-or-replace: the same item can arrive from the HTTP response and
// from a realtime event, so applying it twice must leave a single copy.
export const upsertById = <T extends { id: string }>(list: T[], item: T): T[] => {
  const index = list.findIndex((existing) => existing.id === item.id);

  if (index === -1) {
    return [...list, item];
  }

  const next = [...list];
  next[index] = item;
  return next;
};

export const hasId = (value: unknown): value is { id: string } =>
  typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string';

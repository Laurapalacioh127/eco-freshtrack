import type { Portal } from '@/types';

export const portalTheme: Record<Portal, {
  card: string;
  button: string;
  submit: string;
  badge: string;
  link: string;
}> = {
  user: {
    card: 'bg-brand-soft',
    button: 'bg-brand text-white hover:bg-brand-dark',
    submit: 'bg-brand hover:bg-brand-dark',
    badge: 'bg-brand-soft text-brand-dark',
    link: 'text-brand',
  },
  admin: {
    card: 'bg-ops-soft',
    button: 'bg-ink text-white hover:bg-black/80',
    submit: 'bg-ops hover:bg-ops/90',
    badge: 'bg-ops-soft text-ops',
    link: 'text-ops',
  },
};
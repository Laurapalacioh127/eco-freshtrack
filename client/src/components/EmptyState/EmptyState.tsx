import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export const EmptyState = ({ title, description, actionHref, actionLabel }: EmptyStateProps) => (
  <div role="status" className="flex flex-col items-center gap-2 rounded-2xl bg-brand-soft p-6 text-center text-sm">
    <p className="font-semibold">{title}</p>
    {description && <p className="text-neutral-600">{description}</p>}
    {actionHref && actionLabel && (
      <Link href={actionHref} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
        {actionLabel}
      </Link>
    )}
  </div>
);

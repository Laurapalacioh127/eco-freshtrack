import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, subtitle, action }: PageHeaderProps) => (
  <header className="flex items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="text-xs font-semibold tracking-widest text-brand">{eyebrow}</p>}
      <h1 className="text-4xl font-light">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}
    </div>
    {action}
  </header>
);
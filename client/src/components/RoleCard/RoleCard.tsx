import Link from 'next/link';
import type { Portal } from '@/types';
import { portalTheme } from '@/utils/portalTheme';

interface RoleCardProps {
  portal: Portal;
  tag: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}

export const RoleCard = ({ portal, tag, title, description, href, buttonLabel }: RoleCardProps) => {
  const theme = portalTheme[portal];

  return (
    <article className={`flex flex-col items-start gap-3 rounded-3xl p-8 text-left ${theme.card}`}>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{tag}</span>
      <h3 className="text-2xl font-light leading-snug">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
      <Link href={href} className={`mt-4 rounded-full px-5 py-2.5 text-sm font-semibold ${theme.button}`}>
        {buttonLabel} →
      </Link>
    </article>
  );
};
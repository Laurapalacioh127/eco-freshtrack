'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  label: string;
  exact?: boolean;
  variant: 'light' | 'dark';
}

const variants = {
  light: { active: 'bg-brand-soft text-brand-dark', idle: 'text-neutral-600 hover:bg-black/5' },
  dark: { active: 'bg-white/10 text-white', idle: 'text-white/70 hover:bg-white/5' },
};

export const SidebarLink = ({ href, label, exact = false, variant }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  const styles = variants[variant];

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${isActive ? styles.active : styles.idle}`}
    >
      {label}
    </Link>
  );
};
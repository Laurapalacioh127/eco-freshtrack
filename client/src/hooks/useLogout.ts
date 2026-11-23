'use client';

import { useRouter } from 'next/navigation';
import type { Portal } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { loginPathFor } from '@/utils/authStorage';

export const useLogout = (portal: Portal): (() => void) => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  return () => {
    logout();
    showToast('Cerraste sesión', 'success');
    router.replace(loginPathFor(portal));
  };
};

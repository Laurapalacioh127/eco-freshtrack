'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAxios } from './AxiosProvider';
import type { User } from '@/types';

interface UsersContextValue {
  // The signed-in user's profile (id, name, email, role) from GET /api/users/me.
  me: User | null;
  loading: boolean;
  error: string | null;
}

const UsersContext = createContext<UsersContextValue | null>(null);

// Session-scoped: mount with key={user?.id ?? 'anonymous'} so the profile resets on logout.
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onInit = async () => {
      try {
        const res = await axios.get<User>('/api/users/me');
        setMe(res.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    onInit();
  }, [axios]);

  return <UsersContext.Provider value={{ me, loading, error }}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
};

'use client';

import { useState } from 'react';
import { useUsers } from '@/providers/UsersProvider';
import { getInitials } from '@/utils/format';
import { NotificationBell } from '@/components/NotificationBell/NotificationBell';
import { SearchBox } from '@/components/SearchBox/SearchBox';

export const AdminTopbar = () => {
  const { me } = useUsers();
  const [search, setSearch] = useState('');

  return (
    <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-white px-8 py-3">
      <div className="w-full max-w-sm">
        <SearchBox placeholder="Buscar donaciones, recetas…" value={search} onChange={setSearch} />
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        {me && (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-sm font-semibold">
              {getInitials(me.name)}
            </span>
            <div className="text-xs leading-tight">
              <p className="font-semibold">{me.name}</p>
              <p className="text-neutral-500">Administradora</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
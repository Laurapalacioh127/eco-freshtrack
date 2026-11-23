'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/providers/NotificationsProvider';
import { useToast } from '@/providers/ToastProvider';
import { formatNotificationDate } from '@/utils/format';

interface NotificationBellProps {
  align?: 'start' | 'end';
}

export const NotificationBell = ({ align = 'end' }: NotificationBellProps) => {
  const { notifications, unreadCount, loading, error, markAsRead } = useNotifications();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleSelect = async (id: string) => {
    try {
      await markAsRead(id);
    } catch {
      showToast('No se pudo marcar la notificación como leída', 'error');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-lg"
      >
        🔔
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} sin leer`}
            className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className={`absolute top-full z-50 mt-2 w-80 rounded-2xl bg-white p-3 text-sm text-ink shadow-soft ring-1 ring-black/5 ${
            align === 'start' ? 'left-0' : 'right-0'
          }`}
        >
          <h2 className="px-2 pb-2 text-sm font-semibold">Notificaciones</h2>
          {loading ? (
            <p className="px-2 py-3 text-neutral-500">Cargando notificaciones…</p>
          ) : error ? (
            <p role="alert" className="px-2 py-3 text-rose">
              No pudimos cargar las notificaciones
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-2 py-3 text-neutral-500">No tienes notificaciones</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(notification.id)}
                    className={`w-full rounded-xl px-2 py-2 text-left ${
                      notification.read ? 'text-neutral-600' : 'bg-sun/20 font-semibold'
                    }`}
                  >
                    <span className="block">{notification.message}</span>
                    <span className="block text-xs font-normal text-neutral-500">
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

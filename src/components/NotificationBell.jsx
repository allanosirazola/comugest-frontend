import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: notifications } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unread = notifications?.filter((n) => !n.readAt).length ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleNotificationClick(n) {
    if (!n.readAt) markRead.mutate(n.id);
    setOpen(false);
    if (n.url) navigate(n.url);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-olive-600 transition-colors hover:bg-olive-50 hover:text-olive-900"
        aria-label={t('notifications.title')}
      >
        {/* Bell icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-olive-100 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-olive-100 px-4 py-3">
            <span className="text-sm font-semibold text-olive-900">{t('notifications.title')}</span>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-olive-500 underline underline-offset-2 hover:text-olive-700"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
              <p className="px-4 py-6 text-center text-sm text-olive-500">{t('notifications.empty')}</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-cream-50 ${
                    !n.readAt ? 'bg-olive-50/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm ${!n.readAt ? 'font-semibold text-olive-900' : 'font-medium text-olive-700'}`}>
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-olive-400">
                      {t('notifications.timeAgo', { time: timeAgo(n.createdAt) })}
                    </span>
                  </div>
                  {n.body && (
                    <span className="line-clamp-2 text-xs text-olive-500">{n.body}</span>
                  )}
                  {!n.readAt && (
                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-olive-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

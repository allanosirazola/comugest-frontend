import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useMyReservations } from '@/hooks/useMe';
import { formatDate } from '@/components/StatusBadge';

function formatTime(iso) {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

const STATUS_COLORS = {
  CONFIRMED: 'bg-olive-100 text-olive-800',
  PENDING: 'bg-cream-200 text-olive-700',
  CANCELLED: 'bg-olive-50 text-olive-400 line-through',
};

export function MyReservationsPage() {
  const { t } = useTranslation();
  const { data: reservations, isLoading } = useMyReservations();

  const confirmed = reservations?.filter((r) => r.status === 'CONFIRMED') ?? [];

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('myReservations.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('myReservations.title')}</h1>

      {isLoading && <p className="mt-8 text-olive-600">{t('common.loading')}</p>}

      {!isLoading && confirmed.length === 0 && (
        <div className="card mt-8 text-center">
          <p className="font-display text-xl text-olive-950">{t('myReservations.empty')}</p>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="mt-6 space-y-3">
          {confirmed.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-olive-900">{r.area.name}</h3>
                  <p className="mt-1 text-xs text-olive-500">
                    {t('myReservations.community')}: {r.area.community.name}
                  </p>
                  <p className="mt-1 text-xs text-olive-500">
                    {t('myReservations.date')}: {formatDate(r.startAt)}
                  </p>
                  <p className="mt-1 text-xs text-olive-500">
                    {t('myReservations.time')}: {formatTime(r.startAt)} – {formatTime(r.endAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100'}`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

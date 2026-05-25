import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useMyMeetings } from '@/hooks/useMe';
import { formatDate } from '@/components/StatusBadge';

function formatDateTime(iso) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const TYPE_COLORS = {
  ORDINARY: 'bg-cream-200 text-olive-700',
  EXTRAORDINARY: 'bg-clay-400/20 text-clay-700',
};

const MEETING_STATUS_COLORS = {
  SCHEDULED: 'bg-olive-100 text-olive-800',
  HELD: 'bg-cream-300 text-olive-800',
  CANCELLED: 'bg-olive-50 text-olive-400 line-through',
};

const ATTENDANCE_COLORS = {
  PENDING: 'bg-cream-200 text-olive-700',
  CONFIRMED: 'bg-olive-100 text-olive-800',
  DECLINED: 'bg-clay-400/20 text-clay-700',
  DELEGATED: 'bg-cream-300 text-olive-800',
};

export function MyMeetingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: meetings, isLoading } = useMyMeetings();

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('myMeetings.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('myMeetings.title')}</h1>

      {isLoading && <p className="mt-8 text-olive-600">{t('common.loading')}</p>}

      {!isLoading && meetings?.length === 0 && (
        <div className="card mt-8 text-center">
          <p className="font-display text-xl text-olive-950">{t('myMeetings.empty')}</p>
        </div>
      )}

      {meetings && meetings.length > 0 && (
        <div className="mt-6 space-y-3">
          {meetings.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/communities/${m.community.id}/meetings/${m.id}`)}
              className="card w-full text-left transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-olive-900">{m.title}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[m.type] ?? 'bg-gray-100'}`}
                    >
                      {t(`meetings.type${m.type}`)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${MEETING_STATUS_COLORS[m.status] ?? 'bg-gray-100'}`}
                    >
                      {t(`meetings.status${m.status}`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-olive-500">{m.community.name}</p>
                  <p className="mt-1 text-xs text-olive-500">{formatDateTime(m.scheduledAt)}</p>
                  {m.location && (
                    <p className="mt-1 text-xs text-olive-500">{m.location}</p>
                  )}
                </div>
                {m.attendance && (
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-olive-500">{t('myMeetings.myAttendance')}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ATTENDANCE_COLORS[m.attendance.status] ?? 'bg-gray-100'}`}
                    >
                      {t(`meetings.attendance${m.attendance.status}`)}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}

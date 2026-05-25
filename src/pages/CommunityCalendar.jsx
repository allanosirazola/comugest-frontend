import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunityCalendar } from '@/hooks/useCalendar';
import { getIcalUrl } from '@/api/calendar';

const TYPE_CONFIG = {
  MEETING: { color: 'bg-olive-100 text-olive-800 border-olive-200', label: 'calendar.typeMeeting' },
  RESERVATION: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'calendar.typeReservation' },
  INVOICE_DUE: { color: 'bg-clay-100 text-clay-800 border-clay-200', label: 'calendar.typeInvoice' },
  RECURRING: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'calendar.typeRecurring' },
};

function getMonthRange(year, month) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function CommunityCalendarPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const params = getMonthRange(year, month);
  const { data: events = [], isLoading } = useCommunityCalendar(communityId, params);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Group events by day
  const byDay = events.reduce((acc, ev) => {
    const day = ev.date.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(ev);
    return acc;
  }, {});

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToDetail')}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('calendar.eyebrow')}</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('calendar.title')}</h1>
        </div>
        <a
          href={getIcalUrl(communityId)}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-xs"
        >
          {t('calendar.ical')}
        </a>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="btn-ghost px-3">‹</button>
          <span className="min-w-[140px] text-center font-medium text-olive-900 capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="btn-ghost px-3">›</button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <span key={type} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
            {t(cfg.label)}
          </span>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-olive-600">{t('common.loading')}</p>
      ) : (
        <div className="mt-6">
          {/* Simple list grouped by date — easier than a grid for dense data */}
          {Object.keys(byDay).length === 0 ? (
            <p className="text-center text-olive-500 py-10">{t('calendar.empty')}</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([day, dayEvents]) => (
                <div key={day}>
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-olive-600">
                    {new Date(day + 'T12:00:00').toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <div className="space-y-2">
                    {dayEvents.map((ev) => {
                      const cfg = TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.MEETING;
                      return (
                        <div key={ev.id} className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${cfg.color}`}>
                          <span className="mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-wider opacity-70">
                            {t(cfg.label)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{ev.title}</p>
                            {ev.endDate && (
                              <p className="text-xs opacity-70">
                                {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' → '}
                                {new Date(ev.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunityCalendar } from '@/hooks/useCalendar';
import { getIcalUrl } from '@/api/calendar';

const TYPE_CONFIG = {
  MEETING: { color: 'bg-olive-100 text-olive-800 border-olive-200', dot: 'bg-olive-600', label: 'calendar.typeMeeting' },
  RESERVATION: { color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500', label: 'calendar.typeReservation' },
  INVOICE_DUE: { color: 'bg-clay-100 text-clay-800 border-clay-200', dot: 'bg-clay-500', label: 'calendar.typeInvoice' },
  RECURRING: { color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', label: 'calendar.typeRecurring' },
};

function getMonthRange(year, month) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

/** Build a 6-row × 7-col grid (Mon-Sun) for the given year/month */
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // getDay(): 0=Sun … 6=Sat → convert to Mon=0 … Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function pad(n) { return String(n).padStart(2, '0'); }

export function CommunityCalendarPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [selectedDay, setSelectedDay] = useState(null); // day number or null
  const [copied, setCopied] = useState(false);

  const params = getMonthRange(year, month);
  const { data: events = [], isLoading } = useCommunityCalendar(communityId, params);

  const prevMonth = () => {
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Group events by YYYY-MM-DD key
  const byDay = events.reduce((acc, ev) => {
    const day = ev.date.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(ev);
    return acc;
  }, {});

  const weeks = buildCalendarGrid(year, month);
  const DOW_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const todayStr = now.toISOString().slice(0, 10);

  const handleCopyIcal = async () => {
    try {
      await navigator.clipboard.writeText(getIcalUrl(communityId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text from a temporary input
      const input = document.createElement('input');
      input.value = getIcalUrl(communityId);
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToDetail')}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('calendar.eyebrow')}</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('calendar.title')}</h1>
        </div>

        {/* iCal copy button */}
        <button
          onClick={handleCopyIcal}
          className="btn-ghost text-xs"
          title={t('calendar.ical')}
        >
          {copied ? '✓ Copiado' : t('calendar.ical')}
        </button>

        {/* View toggle */}
        <div className="flex rounded-lg border border-olive-200 overflow-hidden">
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-olive-700 text-cream-50'
                : 'bg-white text-olive-700 hover:bg-olive-50'
            }`}
          >
            📅 {t('calendar.viewCalendar') ?? 'Calendario'}
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-olive-700 text-cream-50'
                : 'bg-white text-olive-700 hover:bg-olive-50'
            }`}
          >
            📋 {t('calendar.viewList') ?? 'Lista'}
          </button>
        </div>

        {/* Month navigation */}
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
      ) : view === 'calendar' ? (
        /* ── CALENDAR GRID VIEW ── */
        <div className="mt-6">
          <div className="overflow-hidden rounded-xl border border-olive-200 bg-white">
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 border-b border-olive-100 bg-cream-100/60">
              {DOW_LABELS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium uppercase tracking-wider text-olive-500">
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 divide-x divide-olive-50 border-b border-olive-50 last:border-0">
                {week.map((day, di) => {
                  const dateStr = day ? `${year}-${pad(month + 1)}-${pad(day)}` : null;
                  const dayEvents = dateStr ? (byDay[dateStr] ?? []) : [];
                  const isToday = dateStr === todayStr;
                  const isSelected = day === selectedDay;

                  return (
                    <div
                      key={di}
                      onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                      className={`min-h-[80px] p-1.5 text-xs transition-colors ${
                        day ? 'cursor-pointer hover:bg-cream-50' : 'bg-cream-50/40'
                      } ${isSelected ? 'bg-olive-50 ring-1 ring-inset ring-olive-300' : ''}`}
                    >
                      {day && (
                        <>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                              isToday
                                ? 'bg-olive-700 text-cream-50'
                                : 'text-olive-800'
                            }`}
                          >
                            {day}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {dayEvents.slice(0, 3).map((ev) => {
                              const cfg = TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.MEETING;
                              return (
                                <span
                                  key={ev.id}
                                  title={ev.title}
                                  className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                                />
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <span className="text-[9px] text-olive-400">+{dayEvents.length - 3}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Day popover / detail panel */}
          {selectedDay !== null && (() => {
            const dateStr = `${year}-${pad(month + 1)}-${pad(selectedDay)}`;
            const dayEvents = byDay[dateStr] ?? [];
            const label = new Date(dateStr + 'T12:00:00').toLocaleDateString('default', {
              weekday: 'long', day: 'numeric', month: 'long',
            });
            return (
              <div className="mt-4 rounded-xl border border-olive-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize text-olive-900">{label}</h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-olive-400 hover:text-olive-700 text-lg leading-none"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                {dayEvents.length === 0 ? (
                  <p className="mt-3 text-sm text-olive-400">{t('calendar.empty')}</p>
                ) : (
                  <div className="mt-3 space-y-2">
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
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="mt-6">
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

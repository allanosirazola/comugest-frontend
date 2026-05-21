import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/TicketBadges';
import { useMetrics, useAllTickets } from '@/hooks/useTickets';
import { TICKET_STATUSES } from '@/api/tickets';
import type { TicketStatus } from '@/types';

export function SupportDashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const { data: metrics } = useMetrics();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const { data: tickets, isLoading } = useAllTickets(statusFilter ? { status: statusFilter } : {});

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('support.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('support.title')}</h1>

      {/* Métricas */}
      {metrics && (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={t('support.openTickets')} value={metrics.tickets.open} accent />
            <Metric label={t('support.inProgress')} value={metrics.tickets.inProgress} />
            <Metric label={t('support.communities')} value={metrics.platform.communities} />
            <Metric label={t('support.totalUsers')} value={metrics.users.total} />
          </section>
          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={t('support.admins')} value={metrics.users.admins} />
            <Metric label={t('support.residents')} value={metrics.users.residents} />
            <Metric label={t('support.units')} value={metrics.platform.units} />
            <Metric label={t('support.newUsers')} value={metrics.users.newLast30Days} />
          </section>
        </>
      )}

      {/* Cola de tickets */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-olive-900">{t('support.queue')}</h2>
          <div className="inline-flex rounded-md border border-olive-200 bg-white p-0.5 text-sm">
            <button onClick={(): void => setStatusFilter('')} className={tabClass(statusFilter === '')}>
              {t('support.all')}
            </button>
            {TICKET_STATUSES.map((s) => (
              <button key={s} onClick={(): void => setStatusFilter(s)} className={tabClass(statusFilter === s)}>
                {t(`tickets.st.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
          {tickets && tickets.length === 0 && (
            <div className="card text-center"><p className="text-olive-600">{t('support.noTickets')}</p></div>
          )}
          {tickets && tickets.length > 0 && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                    <th className="px-4 py-3">{t('tickets.subject')}</th>
                    <th className="px-4 py-3">{t('tickets.reporter')}</th>
                    <th className="px-4 py-3">{t('tickets.category')}</th>
                    <th className="px-4 py-3">{t('tickets.priorityLabel')}</th>
                    <th className="px-4 py-3">{t('tickets.statusLabel')}</th>
                    <th className="px-4 py-3">{t('tickets.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-olive-50 last:border-0 hover:bg-cream-100/30">
                      <td className="px-4 py-3">
                        <Link to={`/tickets/${ticket.id}`} className="font-medium text-olive-900 hover:text-olive-700">
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-olive-600">
                        {ticket.reporter ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-olive-500">{t(`tickets.cat.${ticket.category}`)}</td>
                      <td className="px-4 py-3"><TicketPriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-3 text-olive-500">{formatDate(ticket.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: boolean }): JSX.Element {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-olive-500">{label}</p>
      <p className={`mt-1 font-display text-3xl ${accent && value > 0 ? 'text-clay-600' : 'text-olive-950'}`}>{value}</p>
    </div>
  );
}

function tabClass(active: boolean): string {
  return `rounded px-3 py-1.5 font-medium transition-colors ${active ? 'bg-olive-700 text-cream-50' : 'text-olive-600 hover:bg-olive-50'}`;
}

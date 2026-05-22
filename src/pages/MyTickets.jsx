import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { TicketStatusBadge } from '@/components/TicketBadges';
import { useMyTickets } from '@/hooks/useTickets';

export function MyTicketsPage() {
  const { t } = useTranslation();
  const { data: tickets, isLoading } = useMyTickets();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('tickets.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('tickets.myTickets')}</h1>
        </div>
        <Link to="/report" className="btn-primary">+ {t('tickets.report')}</Link>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
        {tickets && tickets.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('tickets.emptyMine')}</p>
            <Link to="/report" className="btn-primary mt-6 inline-flex">{t('tickets.report')}</Link>
          </div>
        )}
        {tickets?.map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="card flex items-start justify-between gap-4 transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-olive-900">{ticket.subject}</h3>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 text-xs text-olive-500">
                {t(`tickets.cat.${ticket.category}`)} · {formatDate(ticket.createdAt)}
                {ticket._count ? ` · ${ticket._count.comments} ${t('tickets.comments')}` : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

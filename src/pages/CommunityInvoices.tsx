import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { StatusBadge, formatMoney, formatDate } from '@/components/StatusBadge';
import { useCommunityInvoices, useOverdue } from '@/hooks/useInvoices';
import { useCommunity } from '@/hooks/useCommunities';

type Filter = 'ALL' | 'UNPAID' | 'PAID' | 'OVERDUE';

export function CommunityInvoicesPage(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [filter, setFilter] = useState<Filter>('ALL');
  const { data: community } = useCommunity(id);
  const { data: invoices, isLoading } = useCommunityInvoices(id, { status: filter });
  const { data: overdueByOwner } = useOverdue(id);

  const overdueCount = overdueByOwner?.reduce((acc, o) => acc + o.items.length, 0) ?? 0;
  const totalPending = overdueByOwner?.reduce((acc, o) => acc + o.totalPending, 0) ?? 0;

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('invoices.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">
            {t('invoices.listTitle')}
          </h1>
        </div>
        <Link to={`/communities/${id}/invoices/new`} className="btn-primary">
          + {t('invoices.create')}
        </Link>
      </div>

      {overdueCount > 0 && (
        <Link
          to={`/communities/${id}/morosos`}
          className="mt-6 flex items-center justify-between rounded-lg border border-clay-400/40 bg-clay-400/10 px-4 py-3 text-sm transition-colors hover:bg-clay-400/15"
        >
          <span className="text-clay-700">
            <strong>{overdueCount}</strong> {t('invoices.overdueAlert', { count: overdueCount })}
          </span>
          <span className="font-mono font-medium text-clay-700">{formatMoney(totalPending)}</span>
        </Link>
      )}

      {/* Filtros */}
      <div className="mt-6 inline-flex rounded-md border border-olive-200 bg-white p-0.5 text-sm">
        {(['ALL', 'UNPAID', 'PAID', 'OVERDUE'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={(): void => setFilter(f)}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              filter === f ? 'bg-olive-700 text-cream-50' : 'text-olive-600 hover:bg-olive-50'
            }`}
          >
            {t(`invoices.filter.${f}`)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}

        {invoices && invoices.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('invoices.empty')}</p>
            <Link to={`/communities/${id}/invoices/new`} className="btn-primary mt-6 inline-flex">
              {t('invoices.create')}
            </Link>
          </div>
        )}

        {invoices && invoices.length > 0 && (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                  <th className="px-4 py-3">{t('invoices.concept')}</th>
                  <th className="px-4 py-3">{t('invoices.type')}</th>
                  <th className="px-4 py-3">{t('invoices.issueDate')}</th>
                  <th className="px-4 py-3">{t('invoices.dueDate')}</th>
                  <th className="px-4 py-3 text-right">{t('invoices.total')}</th>
                  <th className="px-4 py-3 text-right">{t('invoices.paid')}</th>
                  <th className="px-4 py-3">{t('invoices.statusLabel')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-olive-50 last:border-0 hover:bg-cream-100/30">
                    <td className="px-4 py-3">
                      <Link to={`/invoices/${inv.id}`} className="font-medium text-olive-900 hover:text-olive-700">
                        {inv.concept}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-olive-600">
                      {t(`invoices.type${inv.type}`)}
                    </td>
                    <td className="px-4 py-3 text-olive-700">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-olive-700">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-mono text-olive-900">
                      {formatMoney(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-olive-700">
                      {formatMoney(inv.paidAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

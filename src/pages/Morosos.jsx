import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatMoney, formatDate } from '@/components/StatusBadge';
import { useOverdue } from '@/hooks/useInvoices';
import { useCommunity } from '@/hooks/useCommunities';

export function MorososPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: community } = useCommunity(id);
  const { data: overdueByOwner, isLoading } = useOverdue(id);

  const grandTotal = overdueByOwner?.reduce((acc, o) => acc + o.totalPending, 0) ?? 0;

  return (
    <Layout>
      <Link to={`/communities/${id}/invoices`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('invoices.backToList')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium text-olive-950">{t('morosos.title')}</h1>
      <p className="mt-2 text-sm text-olive-600">{community?.name}</p>

      {isLoading && <p className="mt-8 text-olive-600">{t('common.loading')}</p>}

      {overdueByOwner && overdueByOwner.length === 0 && (
        <div className="card mt-8 text-center">
          <p className="font-display text-xl text-olive-950">{t('morosos.empty')}</p>
          <p className="mt-2 text-sm text-olive-600">{t('morosos.emptyNote')}</p>
        </div>
      )}

      {overdueByOwner && overdueByOwner.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between rounded-lg border border-clay-400/40 bg-clay-400/10 px-4 py-3">
            <span className="text-sm text-clay-700">{t('morosos.totalLabel', { count: overdueByOwner.length })}</span>
            <span className="font-mono text-lg font-medium text-clay-700">{formatMoney(grandTotal)}</span>
          </div>

          <div className="mt-6 space-y-4">
            {overdueByOwner.map((entry) => (
              <div key={entry.owner.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-medium text-olive-900">
                      {entry.owner.firstName} {entry.owner.lastName}
                    </h3>
                    <p className="text-sm text-olive-500">{entry.owner.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-olive-500">{t('invoices.pending')}</p>
                    <p className="font-mono text-xl text-clay-600">{formatMoney(entry.totalPending)}</p>
                  </div>
                </div>

                <table className="mt-4 w-full text-sm">
                  <tbody>
                    {entry.items.map((it) => {
                      const paid = it.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
                      const pending = parseFloat(it.amount) - paid;
                      return (
                        <tr key={it.id} className="border-t border-olive-50">
                          <td className="py-2 text-olive-700">
                            <Link to={`/invoices/${it.invoice.id}`} className="hover:text-olive-900">
                              {it.invoice.concept}
                            </Link>
                            <span className="ml-2 text-xs text-olive-400">· {it.unit.label}</span>
                          </td>
                          <td className="py-2 text-right text-xs text-olive-500">
                            {t('invoices.dueDate')}: {formatDate(it.invoice.dueDate)}
                          </td>
                          <td className="py-2 text-right font-mono text-clay-600">{formatMoney(pending)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}

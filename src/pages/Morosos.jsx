import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatMoney, formatDate } from '@/components/StatusBadge';
import { useOverdue } from '@/hooks/useInvoices';
import { useCommunity } from '@/hooks/useCommunities';
import { useUnitDelinquencyHistory } from '@/hooks/useDelinquency';

function DelinquencyHistoryPanel({ communityId, unitId, unitLabel }) {
  const [open, setOpen] = useState(false);
  const { data: history = [], isLoading } = useUnitDelinquencyHistory(open ? communityId : null, open ? unitId : null);

  const statusColor = (status) => {
    if (status === 'PAID') return 'text-green-700 bg-green-50';
    if (status === 'OVERDUE') return 'text-clay-700 bg-clay-50';
    return 'text-olive-700 bg-cream-100';
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1 text-xs text-olive-400 hover:text-olive-700 underline underline-offset-2"
      >
        Ver historial de pagos ({unitLabel})
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-cream-200 bg-cream-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-olive-700">Historial de pagos · {unitLabel}</p>
        <button onClick={() => setOpen(false)} className="text-xs text-olive-400 hover:text-olive-700">✕</button>
      </div>
      {isLoading && <p className="text-xs text-olive-500">Cargando…</p>}
      {!isLoading && history.length === 0 && (
        <p className="text-xs text-olive-500">Sin historial disponible.</p>
      )}
      {history.map((item, i) => (
        <div key={item.id ?? i} className="mb-1.5 flex items-start justify-between gap-3 text-xs">
          <div>
            <span className="font-medium text-olive-800">{item.concept ?? item.invoice?.concept}</span>
            {item.dueDate && (
              <span className="ml-1 text-olive-400">· Vcto: {new Date(item.dueDate).toLocaleDateString()}</span>
            )}
            {item.daysOverdue > 0 && (
              <span className="ml-1 text-clay-500">{item.daysOverdue}d vencida</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.amount != null && (
              <span className="font-mono text-olive-700">{formatMoney(item.amount)}</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${statusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

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
                            <div>
                              <DelinquencyHistoryPanel
                                communityId={id}
                                unitId={it.unit.id}
                                unitLabel={it.unit.label}
                              />
                            </div>
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

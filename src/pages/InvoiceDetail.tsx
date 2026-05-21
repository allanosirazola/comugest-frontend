import { Fragment, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { StatusBadge, formatMoney, formatDate } from '@/components/StatusBadge';
import { useInvoice, useRecordPayment, useDeletePayment, useCancelInvoice } from '@/hooks/useInvoices';
import type { InvoiceItem } from '@/types';

export function InvoiceDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoice(id);
  const recordPayment = useRecordPayment(id ?? '');
  const deletePayment = useDeletePayment(id ?? '');
  const cancelInvoice = useCancelInvoice();

  const [payingItemId, setPayingItemId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading || !invoice) {
    return (
      <Layout>
        <p className="text-olive-600">{t('common.loading')}</p>
      </Layout>
    );
  }

  const startPaying = (item: InvoiceItem): void => {
    const paid = item.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const remaining = parseFloat(item.amount) - paid;
    setPayingItemId(item.id);
    setPayAmount(remaining.toFixed(2));
    setPayRef('');
    setActionError(null);
  };

  const submitPayment = async (): Promise<void> => {
    if (!payingItemId) return;
    setActionError(null);
    try {
      await recordPayment.mutateAsync({
        itemId: payingItemId,
        input: { amount: parseFloat(payAmount) || 0, reference: payRef.trim() || null },
      });
      setPayingItemId(null);
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setActionError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDeletePayment = async (paymentId: string): Promise<void> => {
    if (!window.confirm(t('invoices.confirmDeletePayment'))) return;
    await deletePayment.mutateAsync(paymentId);
  };

  const handleCancel = async (): Promise<void> => {
    if (!window.confirm(t('invoices.confirmCancel'))) return;
    try {
      await cancelInvoice.mutateAsync(invoice.id);
      navigate(`/communities/${invoice.communityId}/invoices`, { replace: true });
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setActionError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${invoice.communityId}/invoices`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('invoices.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-wider text-olive-600">{t(`invoices.type${invoice.type}`)}</p>
            <StatusBadge status={invoice.status} />
          </div>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{invoice.concept}</h1>
          {invoice.description && <p className="mt-2 max-w-2xl text-sm text-olive-600">{invoice.description}</p>}
        </div>
        {invoice.status !== 'CANCELLED' && (
          <button onClick={handleCancel} className="btn-ghost text-xs text-clay-600 hover:bg-clay-400/10">
            {t('invoices.cancel')}
          </button>
        )}
      </div>

      {/* Resumen */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label={t('invoices.total')} value={formatMoney(invoice.total)} />
        <Stat label={t('invoices.paid')} value={formatMoney(invoice.paidAmount)} />
        <Stat label={t('invoices.pending')} value={formatMoney(invoice.pendingAmount)} accent={invoice.pendingAmount > 0} />
        <Stat label={t('invoices.dueDate')} value={formatDate(invoice.dueDate)} />
      </div>

      {invoice.attachmentUrl && (
        <a href={invoice.attachmentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm text-olive-700 underline underline-offset-4">
          📎 {t('invoices.viewAttachment')}
        </a>
      )}

      {actionError && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {actionError}
        </div>
      )}

      {/* Items */}
      <section className="mt-10">
        <h2 className="font-display text-2xl text-olive-900">{t('invoices.itemsTitle')}</h2>
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                <th className="px-4 py-3">{t('communities.unitLabel')}</th>
                <th className="px-4 py-3 text-right">{t('invoices.amount')}</th>
                <th className="px-4 py-3 text-right">{t('invoices.paid')}</th>
                <th className="px-4 py-3">{t('invoices.statusLabel')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => {
                const paid = item.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
                return (
                  <Fragment key={item.id}>
                    <tr className="border-b border-olive-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-olive-900">{item.unit.label}</span>
                        {item.consumptionValue && (
                          <span className="ml-2 text-xs text-olive-500">
                            {parseFloat(item.consumptionValue).toFixed(2)} {item.consumptionUnit}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-olive-900">{formatMoney(item.amount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-olive-700">{formatMoney(paid)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {invoice.status !== 'CANCELLED' && item.status !== 'PAID' && (
                          <button onClick={(): void => startPaying(item)} className="text-xs font-medium text-olive-700 hover:text-olive-900">
                            {t('invoices.registerPayment')}
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Pagos del item */}
                    {item.payments.length > 0 && (
                      <tr className="border-b border-olive-50 bg-cream-50/50">
                        <td colSpan={5} className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            {item.payments.map((p) => (
                              <span key={p.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-olive-700 ring-1 ring-olive-100">
                                {formatMoney(p.amount)} · {formatDate(p.paidAt)}
                                {p.reference && <span className="text-olive-400">({p.reference})</span>}
                                <button onClick={(): Promise<void> => handleDeletePayment(p.id)} className="text-olive-400 hover:text-clay-600" aria-label={t('common.remove')}>✕</button>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Formulario inline de pago */}
                    {payingItemId === item.id && (
                      <tr className="bg-olive-50">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="flex flex-wrap items-end gap-3">
                            <div>
                              <label className="label">{t('invoices.amount')}</label>
                              <input type="number" step="0.01" min="0" className="input w-32 py-1.5 font-mono" value={payAmount} onChange={(e): void => setPayAmount(e.target.value)} />
                            </div>
                            <div>
                              <label className="label">{t('invoices.reference')}</label>
                              <input className="input py-1.5" value={payRef} onChange={(e): void => setPayRef(e.target.value)} placeholder={t('invoices.referencePlaceholder')} />
                            </div>
                            <button onClick={submitPayment} className="btn-primary py-1.5" disabled={recordPayment.isPending}>
                              {t('common.save')}
                            </button>
                            <button onClick={(): void => setPayingItemId(null)} className="btn-ghost py-1.5">
                              {t('common.cancel')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }): JSX.Element {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-olive-500">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? 'text-clay-600' : 'text-olive-950'}`}>{value}</p>
    </div>
  );
}

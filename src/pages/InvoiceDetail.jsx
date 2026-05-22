import { Fragment, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { StatusBadge, formatMoney, formatDate } from '@/components/StatusBadge';
import { useInvoice, useRecordPayment, useDeletePayment, useCancelInvoice } from '@/hooks/useInvoices';

export function InvoiceDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: invoice, isLoading } = useInvoice(id);
  const recordPayment = useRecordPayment(id ?? '');
  const deletePayment = useDeletePayment(id ?? '');
  const cancelInvoice = useCancelInvoice();

  const [payingItemId, setPayingItemId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [actionError, setActionError] = useState(null);

  if (isLoading || !invoice) {
    return (
      <Layout>
        <p className="text-olive-600">{t('common.loading')}</p>
      </Layout>
    );
  }

  const startPaying = (item) => {
    const paid = item.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const remaining = parseFloat(item.amount) - paid;
    setPayingItemId(item.id);
    setPayAmount(remaining.toFixed(2));
    setPayRef('');
    setActionError(null);
  };

  const submitPayment = async () => {
    if (!payingItemId) return;
    setActionError(null);
    try {
      await recordPayment.mutateAsync({
        itemId: payingItemId,
        input: { amount: parseFloat(payAmount) || 0, reference: payRef.trim() || null },
      });
      setPayingItemId(null);
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm(t('invoices.confirmDeletePayment'))) return;
    await deletePayment.mutateAsync(paymentId);
  };

  const handleCancel = async () => {
    if (!window.confirm(t('invoices.confirmCancel'))) return;
    try {
      await cancelInvoice.mutateAsync(invoice.id);
      navigate(`/communities/${invoice.communityId}/invoices`, { replace: true });
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
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
                          <button onClick={() => startPaying(item)} className="text-xs font-medium text-olive-700 hover:text-olive-900">
                            {t('invoices.registerPayment')}
                          </button>
                        )}
                      </td>
                    </tr>
                    {item.payments.length > 0 && (
                      <tr className="border-b border-olive-50 bg-cream-50/50">
                        <td colSpan={5} className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            {item.payments.map((p) => (
                              <span key={p.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-olive-700 ring-1 ring-olive-100">
                                {formatMoney(p.amount)} · {formatDate(p.paidAt)}
                                {p.reference && <span className="text-olive-400">({p.reference})</span>}
                                <button onClick={() => handleDeletePayment(p.id)} className="text-olive-400 hover:text-clay-600" aria-label={t('common.remove')}>✕</button>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                    {payingItemId === item.id && (
                      <tr className="bg-olive-50">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="flex flex-wrap items-end gap-3">
                            <div>
                              <label className="label">{t('invoices.amount')}</label>
                              <input type="number" step="0.01" min="0" className="input w-32 py-1.5 font-mono" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                            </div>
                            <div>
                              <label className="label">{t('invoices.reference')}</label>
                              <input className="input py-1.5" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder={t('invoices.referencePlaceholder')} />
                            </div>
                            <button onClick={submitPayment} className="btn-primary py-1.5" disabled={recordPayment.isPending}>
                              {t('common.save')}
                            </button>
                            <button onClick={() => setPayingItemId(null)} className="btn-ghost py-1.5">
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

function Stat({ label, value, accent }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-olive-500">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? 'text-clay-600' : 'text-olive-950'}`}>{value}</p>
    </div>
  );
}

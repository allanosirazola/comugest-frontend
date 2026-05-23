import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { StatusBadge, formatMoney, formatDate } from '@/components/StatusBadge';
import { useMyInvoiceItems } from '@/hooks/useInvoices';
import { createInvoiceCheckout } from '@/api/billing';

export function MyInvoicesPage() {
  const { t } = useTranslation();
  const { data: items, isLoading } = useMyInvoiceItems();
  const [params] = useSearchParams();
  const paymentCompleted = params.get('paid') === '1';
  const [loadingCheckout, setLoadingCheckout] = useState(null);

  async function handlePay(communityId, invoiceId) {
    setLoadingCheckout(invoiceId);
    try {
      const url = await createInvoiceCheckout(communityId, invoiceId);
      window.location.href = url;
    } catch {
      setLoadingCheckout(null);
    }
  }

  const totalPending =
    items?.reduce((acc, it) => {
      const paidAmt = it.payments.reduce((a, p) => a + parseFloat(p.amount), 0);
      return acc + Math.max(0, parseFloat(it.amount) - paidAmt);
    }, 0) ?? 0;

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('myInvoices.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('myInvoices.title')}</h1>

      {paymentCompleted && (
        <div className="mt-6 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t('myInvoices.paymentSuccess')}
        </div>
      )}

      {isLoading && <p className="mt-8 text-olive-600">{t('common.loading')}</p>}

      {items && items.length === 0 && (
        <div className="card mt-8 text-center">
          <p className="font-display text-xl text-olive-950">{t('myInvoices.empty')}</p>
          <p className="mt-2 text-sm text-olive-600">{t('myInvoices.emptyNote')}</p>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          {totalPending > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-cream-300 bg-cream-100 px-4 py-3">
              <span className="text-sm text-olive-700">{t('myInvoices.pendingTotal')}</span>
              <span className="font-mono text-lg font-medium text-olive-900">{formatMoney(totalPending)}</span>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {items.map((it) => {
              const paid = it.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
              const pending = parseFloat(it.amount) - paid;
              return (
                <div key={it.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-olive-900">{it.invoice.concept}</h3>
                        <StatusBadge status={it.status} />
                      </div>
                      <p className="mt-1 text-xs text-olive-500">
                        {it.invoice.community.name} · {it.unit.label} · {t('invoices.dueDate')}: {formatDate(it.invoice.dueDate)}
                      </p>
                      {it.consumptionValue && (
                        <p className="mt-1 text-xs text-olive-500">
                          {t('invoices.consumption')}: {parseFloat(it.consumptionValue).toFixed(2)} {it.consumptionUnit}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-mono text-lg text-olive-900">{formatMoney(it.amount)}</p>
                      {pending > 0 && it.payments.length > 0 && (
                        <p className="text-xs text-clay-600">{t('invoices.pending')}: {formatMoney(pending)}</p>
                      )}
                      {pending > 0 && (
                        <button
                          onClick={() => handlePay(it.invoice.community.id, it.invoice.id)}
                          disabled={loadingCheckout === it.invoice.id}
                          className="btn text-xs disabled:opacity-60"
                        >
                          {loadingCheckout === it.invoice.id ? '…' : t('myInvoices.pay')}
                        </button>
                      )}
                    </div>
                  </div>
                  {it.invoice.attachmentUrl && (
                    <a href={it.invoice.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs text-olive-700 underline underline-offset-4">
                      📎 {t('invoices.viewAttachment')}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
}

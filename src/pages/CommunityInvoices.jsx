import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { StatusBadge, formatMoney, formatDate } from '@/components/StatusBadge';
import { useCommunityInvoices, useOverdue, useCreateBulkInvoice } from '@/hooks/useInvoices';
import { useCommunity } from '@/hooks/useCommunities';

const FILTERS = ['ALL', 'UNPAID', 'PAID', 'OVERDUE'];

export function CommunityInvoicesPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [filter, setFilter] = useState('ALL');
  const { data: community } = useCommunity(id);
  const { data: invoices, isLoading } = useCommunityInvoices(id, { status: filter });
  const { data: overdueByOwner } = useOverdue(id);
  const createBulkInvoice = useCreateBulkInvoice(id);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ concept: '', dueDate: '', perUnitAmount: '' });
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  const overdueCount = overdueByOwner?.reduce((acc, o) => acc + o.items.length, 0) ?? 0;
  const totalPending = overdueByOwner?.reduce((acc, o) => acc + o.totalPending, 0) ?? 0;

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError(null);
    try {
      await createBulkInvoice.mutateAsync({
        concept: bulkForm.concept,
        dueDate: bulkForm.dueDate,
        distributionMode: 'EQUAL',
        perUnitAmount: parseFloat(bulkForm.perUnitAmount),
      });
      setBulkSuccess(true);
      setTimeout(() => {
        setShowBulkModal(false);
        setBulkSuccess(false);
        setBulkForm({ concept: '', dueDate: '', perUnitAmount: '' });
      }, 1500);
    } catch (err) {
      setBulkError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

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
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowBulkModal(true); setBulkError(null); setBulkSuccess(false); }} className="btn-ghost">
            + {t('invoices.createBulk')}
          </button>
          <Link to={`/communities/${id}/invoices/new`} className="btn-primary">
            + {t('invoices.create')}
          </Link>
        </div>
      </div>

      {/* Bulk invoice modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 font-display text-xl font-medium text-olive-950">{t('invoices.createBulk')}</h2>
            <p className="mb-4 text-sm text-olive-600">{t('invoices.bulkSubtitle')}</p>
            {bulkSuccess ? (
              <p className="rounded-md bg-olive-100 px-4 py-3 text-sm font-medium text-olive-800">
                ✓ {t('invoices.bulkSuccess')}
              </p>
            ) : (
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="bulk-concept">{t('invoices.concept')}</label>
                  <input
                    id="bulk-concept"
                    className="input"
                    value={bulkForm.concept}
                    onChange={(e) => setBulkForm({ ...bulkForm, concept: e.target.value })}
                    placeholder="Derrama ascensor 2026"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="bulk-due">{t('invoices.dueDate')}</label>
                  <input
                    id="bulk-due"
                    type="date"
                    className="input"
                    value={bulkForm.dueDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="bulk-amount">{t('invoices.perUnitAmount')}</label>
                  <input
                    id="bulk-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="input font-mono"
                    value={bulkForm.perUnitAmount}
                    onChange={(e) => setBulkForm({ ...bulkForm, perUnitAmount: e.target.value })}
                    placeholder="150.00"
                    required
                  />
                </div>
                {bulkError && (
                  <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                    {bulkError}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button type="button" className="text-sm text-olive-600 hover:text-olive-900" onClick={() => setShowBulkModal(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn-primary" disabled={createBulkInvoice.isPending}>
                    {createBulkInvoice.isPending ? t('common.loading') : t('invoices.bulkSubmit')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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

      <div className="mt-6 inline-flex rounded-md border border-olive-200 bg-white p-0.5 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
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

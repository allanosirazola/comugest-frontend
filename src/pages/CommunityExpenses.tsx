import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { ExpenseBreakdown } from '@/components/ExpenseBreakdown';
import { formatMoney, formatDate } from '@/components/StatusBadge';
import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { EXPENSE_CATEGORIES } from '@/api/expenses';
import type { ExpenseCategory } from '@/types';

export function CommunityExpensesPage(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: community } = useCommunity(id);

  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | ''>('');
  const filter = categoryFilter ? { category: categoryFilter } : {};
  const { data, isLoading } = useCommunityExpenses(id, filter);
  const createExpense = useCreateExpense(id ?? '');
  const deleteExpense = useDeleteExpense();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'CLEANING' as ExpenseCategory,
    concept: '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    supplier: '',
    attachmentUrl: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      await createExpense.mutateAsync({
        category: form.category,
        concept: form.concept.trim(),
        amount: parseFloat(form.amount) || 0,
        expenseDate: new Date(form.expenseDate).toISOString(),
        supplier: form.supplier.trim() || null,
        attachmentUrl: form.attachmentUrl.trim() || null,
        description: form.description.trim() || null,
      });
      setForm({ ...form, concept: '', amount: '', supplier: '', attachmentUrl: '', description: '' });
      setShowForm(false);
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDelete = async (expenseId: string): Promise<void> => {
    if (!window.confirm(t('expenses.confirmDelete'))) return;
    await deleteExpense.mutateAsync(expenseId);
  };

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('expenses.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('expenses.title')}</h1>
        </div>
        <button onClick={(): void => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? t('common.cancel') : `+ ${t('expenses.create')}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">{t('expenses.categoryLabel')}</label>
              <select id="category" className="input" value={form.category} onChange={(e): void => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`expenses.category.${c}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="amount">{t('expenses.amount')}</label>
              <input id="amount" type="number" step="0.01" min="0" className="input font-mono" value={form.amount} onChange={(e): void => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="concept">{t('expenses.concept')}</label>
            <input id="concept" className="input" value={form.concept} onChange={(e): void => setForm({ ...form, concept: e.target.value })} required placeholder={t('expenses.conceptPlaceholder')} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="expenseDate">{t('expenses.date')}</label>
              <input id="expenseDate" type="date" className="input" value={form.expenseDate} onChange={(e): void => setForm({ ...form, expenseDate: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="supplier">{t('expenses.supplier')}</label>
              <input id="supplier" className="input" value={form.supplier} onChange={(e): void => setForm({ ...form, supplier: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="attachmentUrl">{t('expenses.attachmentUrl')}</label>
            <input id="attachmentUrl" type="url" className="input" value={form.attachmentUrl} onChange={(e): void => setForm({ ...form, attachmentUrl: e.target.value })} placeholder="https://…" />
          </div>
          {error && <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">{error}</div>}
          <button type="submit" className="btn-primary" disabled={createExpense.isPending}>
            {createExpense.isPending ? t('common.loading') : t('expenses.save')}
          </button>
        </form>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Lista */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <select className="input max-w-xs py-1.5 text-sm" value={categoryFilter} onChange={(e): void => setCategoryFilter(e.target.value as ExpenseCategory | '')}>
              <option value="">{t('expenses.allCategories')}</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`expenses.category.${c}`)}</option>
              ))}
            </select>
          </div>

          {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
          {data && data.expenses.length === 0 && (
            <div className="card text-center">
              <p className="font-display text-xl text-olive-950">{t('expenses.empty')}</p>
            </div>
          )}
          {data && data.expenses.length > 0 && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                    <th className="px-4 py-3">{t('expenses.date')}</th>
                    <th className="px-4 py-3">{t('expenses.concept')}</th>
                    <th className="px-4 py-3">{t('expenses.categoryLabel')}</th>
                    <th className="px-4 py-3 text-right">{t('expenses.amount')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((ex) => (
                    <tr key={ex.id} className="border-b border-olive-50 last:border-0">
                      <td className="px-4 py-3 text-olive-600">{formatDate(ex.expenseDate)}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-olive-900">{ex.concept}</span>
                        {ex.supplier && <span className="ml-2 text-xs text-olive-400">{ex.supplier}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-olive-600">
                        {t(`expenses.category.${ex.category}`)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-olive-900">{formatMoney(ex.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(): Promise<void> => handleDelete(ex.id)} className="text-xs text-olive-500 hover:text-clay-600">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Desglose */}
        {data && data.expenses.length > 0 && (
          <aside className="card h-fit">
            <h2 className="mb-4 font-display text-lg text-olive-900">{t('expenses.breakdown')}</h2>
            <ExpenseBreakdown byCategory={data.summary.byCategory} total={data.summary.total} />
          </aside>
        )}
      </div>
    </Layout>
  );
}

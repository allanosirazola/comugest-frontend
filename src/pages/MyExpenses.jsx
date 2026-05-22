import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { ExpenseBreakdown } from '@/components/ExpenseBreakdown';
import { formatMoney, formatDate } from '@/components/StatusBadge';
import { useMyCommunities } from '@/hooks/useCommunities';
import { useMyExpenses } from '@/hooks/useExpenses';

export function MyExpensesPage() {
  const { t } = useTranslation();
  const { data: communities } = useMyCommunities();
  const [communityId, setCommunityId] = useState('');

  useEffect(() => {
    if (!communityId && communities && communities.length > 0) {
      setCommunityId(communities[0].id);
    }
  }, [communities, communityId]);

  const { data, isLoading } = useMyExpenses(communityId || undefined);

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('expenses.transparencyEyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('expenses.transparencyTitle')}</h1>
      <p className="mt-3 max-w-xl text-sm text-olive-600">{t('expenses.transparencyNote')}</p>

      {communities && communities.length === 0 && (
        <div className="card mt-8 text-center">
          <p className="font-display text-xl text-olive-950">{t('expenses.notInCommunity')}</p>
        </div>
      )}

      {communities && communities.length > 1 && (
        <div className="mt-6 max-w-xs">
          <label className="label">{t('expenses.selectCommunity')}</label>
          <select className="input" value={communityId} onChange={(e) => setCommunityId(e.target.value)}>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading && <p className="mt-8 text-olive-600">{t('common.loading')}</p>}

      {data && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="card h-fit">
            <h2 className="mb-4 font-display text-lg text-olive-900">{t('expenses.breakdown')}</h2>
            <ExpenseBreakdown byCategory={data.summary.byCategory} total={data.summary.total} />
          </aside>

          <div>
            {data.expenses.length === 0 ? (
              <div className="card text-center">
                <p className="font-display text-lg text-olive-950">{t('expenses.empty')}</p>
              </div>
            ) : (
              <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                      <th className="px-4 py-3">{t('expenses.date')}</th>
                      <th className="px-4 py-3">{t('expenses.concept')}</th>
                      <th className="px-4 py-3">{t('expenses.categoryLabel')}</th>
                      <th className="px-4 py-3 text-right">{t('expenses.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses.map((ex) => (
                      <tr key={ex.id} className="border-b border-olive-50 last:border-0">
                        <td className="px-4 py-3 text-olive-600">{formatDate(ex.expenseDate)}</td>
                        <td className="px-4 py-3 font-medium text-olive-900">{ex.concept}</td>
                        <td className="px-4 py-3 text-xs uppercase tracking-wider text-olive-600">
                          {t(`expenses.category.${ex.category}`)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-olive-900">{formatMoney(ex.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

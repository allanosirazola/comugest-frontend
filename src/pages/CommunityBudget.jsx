import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Layout } from '@/components/Layout';
import { formatMoney } from '@/components/StatusBadge';
import { useCommunity } from '@/hooks/useCommunities';
import { useBudget, useUpsertBudget, useBudgetComparison } from '@/hooks/useBudgets';

const CATEGORIES = [
  'CLEANING',
  'LIFT',
  'GARBAGE',
  'GARDENING',
  'MAINTENANCE',
  'INSURANCE',
  'ELECTRICITY',
  'WATER',
  'SECURITY',
  'ADMIN_FEES',
  'SUPPLIES',
  'OTHER',
];

function buildEmptyAmounts() {
  return Object.fromEntries(CATEGORIES.map((c) => [c, '']));
}

export function CommunityBudgetPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: community } = useCommunity(id);
  const { data: budget } = useBudget(id, year);
  const upsert = useUpsertBudget(id, year);

  // Build form amounts: pre-fill from existing data if available
  const initialAmounts = () => {
    if (!budget?.lines) return buildEmptyAmounts();
    const map = Object.fromEntries(budget.lines.map((l) => [l.category, String(l.budgeted)]));
    return Object.fromEntries(CATEGORIES.map((c) => [c, map[c] ?? '']));
  };

  const [amounts, setAmounts] = useState(initialAmounts);
  const [savedYear, setSavedYear] = useState(null);
  const [error, setError] = useState(null);

  // Re-sync form when budget data or year changes
  const budgetKey = `${id}-${year}-${budget ? 'loaded' : 'empty'}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const lines = CATEGORIES.map((c) => ({
        category: c,
        amount: parseFloat(amounts[c]) || 0,
      }));
      await upsert.mutateAsync({ year, lines });
      setSavedYear(year);
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  // When year changes, reset form from new budget data
  const handleYearChange = (delta) => {
    setYear((y) => y + delta);
    setSavedYear(null);
    setError(null);
    // reset amounts; they'll be overwritten by the effect below when budget loads
    setAmounts(buildEmptyAmounts());
  };

  // Sync amounts when budget data arrives for this year
  // We use a derived key trick: only update amounts when budget changes
  const derivedAmounts = budget?.lines
    ? Object.fromEntries(
        budget.lines.map((l) => [l.category, l.budgeted])
      )
    : null;

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('budgets.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">
            {t('budgets.title', { year })}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleYearChange(-1)} className="btn-ghost text-sm">
            ← {t('budgets.prevYear')}
          </button>
          <button onClick={() => handleYearChange(1)} className="btn-ghost text-sm">
            {t('budgets.nextYear')} →
          </button>
        </div>
      </div>

      {!budget && (
        <p className="mt-6 text-sm text-olive-600">{t('budgets.noData')}</p>
      )}

      <form onSubmit={onSubmit} className="card mt-6">
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const existingBudgeted = derivedAmounts?.[cat];
            const value = amounts[cat] !== '' ? amounts[cat] : (existingBudgeted !== undefined ? String(existingBudgeted) : '');
            return (
              <div key={cat} className="grid items-center gap-4 sm:grid-cols-[1fr_200px]">
                <label className="text-sm font-medium text-olive-800" htmlFor={`cat-${cat}`}>
                  {t(`expenses.category.${cat}`)}
                </label>
                <input
                  id={`cat-${cat}`}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input font-mono"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [cat]: e.target.value }))}
                />
              </div>
            );
          })}
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
            {error}
          </div>
        )}

        {savedYear === year && (
          <p className="mt-3 text-sm text-olive-600">{t('common.save')} ✓</p>
        )}

        <button type="submit" className="btn-primary mt-6" disabled={upsert.isPending}>
          {upsert.isPending ? t('common.loading') : t('budgets.save')}
        </button>
      </form>

      {budget?.lines && budget.lines.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-olive-900">{t('budgets.comparison')}</h2>
          <div className="card mt-4 overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                  <th className="px-4 py-3">{t('budgets.category')}</th>
                  <th className="px-4 py-3 text-right">{t('budgets.budgeted')}</th>
                  <th className="px-4 py-3 text-right">{t('budgets.actual')}</th>
                  <th className="px-4 py-3 text-right">{t('budgets.variance')}</th>
                </tr>
              </thead>
              <tbody>
                {budget.lines.map((line) => (
                  <tr key={line.category} className="border-b border-olive-50 last:border-0">
                    <td className="px-4 py-3 text-olive-800">
                      {t(`expenses.category.${line.category}`)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-olive-700">
                      {formatMoney(line.budgeted)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-olive-700">
                      {formatMoney(line.actual)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-medium ${
                        line.variance >= 0 ? 'text-olive-700' : 'text-clay-700'
                      }`}
                    >
                      {line.variance >= 0 ? '+' : ''}
                      {formatMoney(line.variance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <BudgetVsActualChart communityId={id} />
    </Layout>
  );
}

function BudgetVsActualChart({ communityId }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading } = useBudgetComparison(communityId, year);

  if (isLoading) return <p className="mt-6 text-sm text-olive-500">Cargando…</p>;
  if (!data?.lines?.length) return <p className="mt-6 text-sm text-olive-400">No hay datos para comparar.</p>;

  const chartData = data.lines.map((l) => ({
    name: l.category,
    Presupuesto: l.budgeted,
    Real: l.actual,
  }));

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-medium text-olive-900">Presupuesto vs Real</h2>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input w-24 text-sm"
        >
          {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 40, left: 20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toLocaleString()}€`} />
          <Tooltip
            formatter={(v) =>
              `${Number(v).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
            }
          />
          <Legend />
          <Bar dataKey="Presupuesto" fill="#4a5329" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Real" fill="#c17d4d" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-olive-50 px-3 py-2 text-center">
          <p className="text-olive-500">Total presupuestado</p>
          <p className="font-semibold text-olive-800">
            {data.totalBudgeted.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </p>
        </div>
        <div
          className={`rounded-lg px-3 py-2 text-center ${
            data.totalActual > data.totalBudgeted ? 'bg-clay-400/10' : 'bg-olive-50'
          }`}
        >
          <p className="text-olive-500">Total ejecutado</p>
          <p
            className={`font-semibold ${
              data.totalActual > data.totalBudgeted ? 'text-clay-700' : 'text-olive-800'
            }`}
          >
            {data.totalActual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </p>
        </div>
      </div>
    </div>
  );
}

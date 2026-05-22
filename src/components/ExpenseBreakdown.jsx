import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/components/StatusBadge';

// Paleta de tonos para las categorías (derivada de la paleta olive/clay/cream)
const COLORS = [
  '#485436', '#778856', '#94a571', '#b3bf94',
  '#c66a40', '#d28560', '#d4b566', '#dfca88',
  '#5d6c42', '#3b442e', '#b25334', '#a8a99a',
];

export function ExpenseBreakdown({ byCategory, total }) {
  const { t } = useTranslation();

  if (byCategory.length === 0) {
    return <p className="text-sm text-olive-500">{t('expenses.noData')}</p>;
  }

  return (
    <div>
      {/* Barra apilada */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-cream-200">
        {byCategory.map((c, i) => (
          <div
            key={c.category}
            style={{ width: `${c.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
            title={`${t(`expenses.category.${c.category}`)} · ${c.percentage}%`}
          />
        ))}
      </div>

      {/* Leyenda con importes */}
      <ul className="mt-4 space-y-2">
        {byCategory.map((c, i) => (
          <li key={c.category} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-olive-700">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {t(`expenses.category.${c.category}`)}
              <span className="text-xs text-olive-400">({c.count})</span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-olive-900">{formatMoney(c.total)}</span>
              <span className="w-12 text-right text-xs text-olive-400">{c.percentage}%</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-olive-100 pt-3 text-sm font-medium">
        <span className="text-olive-700">{t('expenses.total')}</span>
        <span className="font-mono text-lg text-olive-950">{formatMoney(total)}</span>
      </div>
    </div>
  );
}

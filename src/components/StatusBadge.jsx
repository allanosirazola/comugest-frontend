import { useTranslation } from 'react-i18next';

const COLORS = {
  PAID: 'bg-olive-100 text-olive-800',
  PENDING: 'bg-cream-200 text-olive-700',
  PARTIALLY_PAID: 'bg-cream-300 text-olive-800',
  OVERDUE: 'bg-clay-400/20 text-clay-700',
  CANCELLED: 'bg-olive-50 text-olive-400 line-through',
};

export function StatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status] ?? 'bg-gray-100'}`}
    >
      {t(`invoices.status.${status}`)}
    </span>
  );
}

export function formatMoney(value, locale = 'es-ES') {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(num);
}

export function formatDate(iso, locale = 'es-ES') {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(
    new Date(iso)
  );
}

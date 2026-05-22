import { useTranslation } from 'react-i18next';

const COLORS = {
  SUBMITTED: 'bg-cream-300 text-olive-800',
  IN_REVIEW: 'bg-clay-400/15 text-clay-600',
  IN_PROGRESS: 'bg-cream-200 text-olive-700',
  COMPLETED: 'bg-olive-100 text-olive-800',
  REJECTED: 'bg-clay-500/20 text-clay-700',
};

export function ProcedureStatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}>
      {t(`procedures.st.${status}`)}
    </span>
  );
}

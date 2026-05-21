import { useTranslation } from 'react-i18next';
import type { TicketStatus, TicketPriority } from '@/types';

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-clay-400/20 text-clay-700',
  IN_PROGRESS: 'bg-cream-300 text-olive-800',
  RESOLVED: 'bg-olive-100 text-olive-800',
  CLOSED: 'bg-olive-50 text-olive-400',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'bg-olive-50 text-olive-500',
  MEDIUM: 'bg-cream-200 text-olive-700',
  HIGH: 'bg-clay-400/15 text-clay-600',
  URGENT: 'bg-clay-500/25 text-clay-700',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }): JSX.Element {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {t(`tickets.st.${status}`)}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }): JSX.Element {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[priority]}`}>
      {t(`tickets.pr.${priority}`)}
    </span>
  );
}

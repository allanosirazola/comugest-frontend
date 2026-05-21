import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/TicketBadges';
import { useAuth } from '@/contexts/AuthContext';
import { useTicket, useUpdateTicket, useAddComment } from '@/hooks/useTickets';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/api/tickets';
import type { TicketStatus, TicketPriority } from '@/types';

export function TicketDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isSupport = user?.role === 'SUPPORT';
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket(id ?? '');
  const addComment = useAddComment(id ?? '');

  const [comment, setComment] = useState('');
  const [internal, setInternal] = useState(false);

  if (isLoading || !ticket) {
    return <Layout><p className="text-olive-600">{t('common.loading')}</p></Layout>;
  }

  const backTo = isSupport ? '/support/tickets' : '/my-tickets';

  const onComment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment.mutateAsync({ body: comment.trim(), internal });
    setComment('');
    setInternal(false);
  };

  return (
    <Layout>
      <Link to={backTo} className="text-sm text-olive-600 hover:text-olive-900">← {t('tickets.back')}</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <span className="text-xs uppercase tracking-wider text-olive-500">{t(`tickets.cat.${ticket.category}`)}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-medium text-olive-950">{ticket.subject}</h1>
          {ticket.reporter && (
            <p className="mt-1 text-xs text-olive-500">
              {ticket.reporter.firstName} {ticket.reporter.lastName} · {formatDate(ticket.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Conversación */}
        <div>
          <div className="card">
            <p className="whitespace-pre-wrap text-sm text-olive-800">{ticket.description}</p>
          </div>

          <div className="mt-4 space-y-3">
            {ticket.comments?.map((c) => (
              <div key={c.id} className={`card ${c.internal ? 'border-clay-400/40 bg-clay-400/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-olive-900">
                    {c.author.firstName} {c.author.lastName}
                    {c.author.role === 'SUPPORT' && <span className="ml-2 text-xs text-olive-500">{t('tickets.supportTeam')}</span>}
                  </span>
                  <span className="text-xs text-olive-400">{formatDate(c.createdAt)}</span>
                </div>
                {c.internal && <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-clay-600">{t('tickets.internalNote')}</p>}
                <p className="mt-2 whitespace-pre-wrap text-sm text-olive-700">{c.body}</p>
              </div>
            ))}
          </div>

          {/* Nuevo comentario */}
          {ticket.status !== 'CLOSED' && (
            <form onSubmit={onComment} className="card mt-4 space-y-3">
              <textarea className="input min-h-20" value={comment} onChange={(e): void => setComment(e.target.value)} placeholder={t('tickets.commentPlaceholder')} />
              <div className="flex items-center justify-between">
                {isSupport && (
                  <label className="flex items-center gap-2 text-xs text-olive-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-olive-300 text-olive-700" checked={internal} onChange={(e): void => setInternal(e.target.checked)} />
                    {t('tickets.internalNoteCheck')}
                  </label>
                )}
                <button type="submit" className="btn-primary ml-auto py-1.5" disabled={addComment.isPending || !comment.trim()}>
                  {t('tickets.sendComment')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Panel lateral */}
        <aside className="space-y-4">
          {isSupport && (
            <div className="card space-y-4">
              <h2 className="font-display text-lg text-olive-900">{t('tickets.manage')}</h2>
              <div>
                <label className="label">{t('tickets.statusLabel')}</label>
                <select
                  className="input"
                  value={ticket.status}
                  onChange={(e): void => void updateTicket.mutate({ status: e.target.value as TicketStatus })}
                >
                  {TICKET_STATUSES.map((s) => <option key={s} value={s}>{t(`tickets.st.${s}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('tickets.priorityLabel')}</label>
                <select
                  className="input"
                  value={ticket.priority}
                  onChange={(e): void => void updateTicket.mutate({ priority: e.target.value as TicketPriority })}
                >
                  {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{t(`tickets.pr.${p}`)}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Contexto técnico (solo SUPPORT) */}
          {isSupport && (ticket.pageUrl || ticket.userAgent) && (
            <div className="card">
              <h2 className="mb-2 font-display text-sm text-olive-900">{t('tickets.techContext')}</h2>
              {ticket.pageUrl && <p className="break-all text-xs text-olive-500">URL: {ticket.pageUrl}</p>}
              {ticket.userAgent && <p className="mt-1 break-all text-xs text-olive-500">UA: {ticket.userAgent}</p>}
            </div>
          )}
        </aside>
      </div>
    </Layout>
  );
}

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

const ACTION_LABELS = {
  INVOICE_CREATED: 'invoice.created',
  INVOICE_CANCELLED: 'invoice.cancelled',
  PAYMENT_RECORDED: 'payment.recorded',
  PAYMENT_DELETED: 'payment.deleted',
  RESIDENT_INVITED: 'resident.invited',
  RESIDENT_ACTIVATED: 'resident.activated',
  COMMUNITY_CREATED: 'community.created',
  COMMUNITY_DELETED: 'community.deleted',
  ANNOUNCEMENT_PUBLISHED: 'announcement.published',
  EXPENSE_CREATED: 'expense.created',
  EXPENSE_DELETED: 'expense.deleted',
  PROCEDURE_SUBMITTED: 'procedure.submitted',
  PROCEDURE_STATUS_CHANGED: 'procedure.statusChanged',
  TICKET_CREATED: 'ticket.created',
  TICKET_STATUS_CHANGED: 'ticket.statusChanged',
  BUDGET_UPSERTED: 'budget.upserted',
  USER_LOGIN: 'user.login',
  USER_ROLE_CHANGED: 'user.roleChanged',
};

async function fetchAuditLogs({ action, communityId, cursor }) {
  const params = {};
  if (action) params.action = action;
  if (communityId) params.communityId = communityId;
  if (cursor) params.cursor = cursor;
  params.limit = 50;
  const { data } = await api.get('/admin/audit', { params });
  return data;
}

export function AuditLogPage() {
  const { t } = useTranslation();
  const [action, setAction] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [pages, setPages] = useState([null]); // array of cursors; pages[0]=null means first page
  const [pageIdx, setPageIdx] = useState(0);

  const cursor = pages[pageIdx] ?? null;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audit', action, communityId, cursor],
    queryFn: () => fetchAuditLogs({ action, communityId, cursor }),
    keepPreviousData: true,
  });

  const applyFilter = useCallback(() => {
    setPages([null]);
    setPageIdx(0);
  }, []);

  const goNext = () => {
    if (!data?.nextCursor) return;
    setPages((prev) => {
      const next = [...prev];
      next[pageIdx + 1] = data.nextCursor;
      return next;
    });
    setPageIdx((i) => i + 1);
  };

  const goPrev = () => {
    if (pageIdx === 0) return;
    setPageIdx((i) => i - 1);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('audit.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('audit.title')}</h1>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">{t('audit.filterAction')}</label>
          <select
            className="input py-2"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">{t('audit.allActions')}</option>
            {Object.keys(ACTION_LABELS).map((a) => (
              <option key={a} value={a}>
                {t(`audit.action.${ACTION_LABELS[a]}`, { defaultValue: a })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('audit.filterCommunity')}</label>
          <input
            className="input py-2"
            placeholder={t('audit.communityIdPlaceholder')}
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
          />
        </div>
        <button onClick={applyFilter} className="btn-primary py-2">
          {t('common.filter')}
        </button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-olive-600">{t('common.loading')}</p>
      ) : (
        <>
          <div className="card mt-6 overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                  <th className="px-4 py-3">{t('audit.colDate')}</th>
                  <th className="px-4 py-3">{t('audit.colAction')}</th>
                  <th className="px-4 py-3">{t('audit.colActor')}</th>
                  <th className="px-4 py-3">{t('audit.colTarget')}</th>
                  <th className="px-4 py-3">{t('audit.colMeta')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.logs?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-olive-500">
                      {t('audit.empty')}
                    </td>
                  </tr>
                )}
                {data?.logs?.map((log) => (
                  <tr key={log.id} className="border-b border-olive-50 hover:bg-cream-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-olive-600">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-olive-100 px-2 py-0.5 text-xs font-medium text-olive-800">
                        {t(`audit.action.${ACTION_LABELS[log.action]}`, { defaultValue: log.action })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-olive-800">
                      {log.actor
                        ? `${log.actor.firstName} ${log.actor.lastName}`
                        : <span className="text-olive-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-olive-600 text-xs">
                      {log.targetType && (
                        <span>
                          {log.targetType}
                          {log.targetId && <span className="ml-1 font-mono text-olive-400">{log.targetId.slice(0, 8)}…</span>}
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-olive-500">
                      {log.meta ? JSON.stringify(log.meta) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button onClick={goPrev} disabled={pageIdx === 0 || isFetching} className="btn-ghost text-sm disabled:opacity-40">
              ← {t('common.prev')}
            </button>
            <span className="text-sm text-olive-600">{t('audit.page', { n: pageIdx + 1 })}</span>
            <button onClick={goNext} disabled={!data?.nextCursor || isFetching} className="btn-ghost text-sm disabled:opacity-40">
              {t('common.next')} →
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}

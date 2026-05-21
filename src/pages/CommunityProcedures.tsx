import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { ProcedureStatusBadge } from '@/components/ProcedureStatusBadge';
import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityProcedures } from '@/hooks/useProcedures';
import { PROCEDURE_STATUSES } from '@/api/procedures';
import type { ProcedureStatus } from '@/types';

export function CommunityProceduresPage(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: community } = useCommunity(id);
  const [statusFilter, setStatusFilter] = useState<ProcedureStatus | ''>('');
  const { data: procedures, isLoading } = useCommunityProcedures(id, statusFilter ? { status: statusFilter } : {});

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-olive-600">{t('procedures.eyebrow')}</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('procedures.queueTitle')}</h1>
      </div>

      <div className="mt-6 inline-flex flex-wrap gap-0.5 rounded-md border border-olive-200 bg-white p-0.5 text-sm">
        <button onClick={(): void => setStatusFilter('')} className={tabClass(statusFilter === '')}>
          {t('procedures.all')}
        </button>
        {PROCEDURE_STATUSES.map((s) => (
          <button key={s} onClick={(): void => setStatusFilter(s)} className={tabClass(statusFilter === s)}>
            {t(`procedures.st.${s}`)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
        {procedures && procedures.length === 0 && (
          <div className="card text-center"><p className="text-olive-600">{t('procedures.emptyQueue')}</p></div>
        )}
        {procedures && procedures.length > 0 && (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                  <th className="px-4 py-3">{t('procedures.subject')}</th>
                  <th className="px-4 py-3">{t('procedures.requester')}</th>
                  <th className="px-4 py-3">{t('procedures.type')}</th>
                  <th className="px-4 py-3">{t('procedures.statusLabel')}</th>
                  <th className="px-4 py-3">{t('procedures.date')}</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((p) => (
                  <tr key={p.id} className="border-b border-olive-50 last:border-0 hover:bg-cream-100/30">
                    <td className="px-4 py-3">
                      <Link to={`/procedures/${p.id}`} className="font-medium text-olive-900 hover:text-olive-700">
                        {p.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-olive-600">
                      {p.requester ? `${p.requester.firstName} ${p.requester.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-olive-500">{t(`procedures.ty.${p.type}`)}</td>
                    <td className="px-4 py-3"><ProcedureStatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-olive-500">{formatDate(p.createdAt)}</td>
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

function tabClass(active: boolean): string {
  return `rounded px-3 py-1.5 font-medium transition-colors ${active ? 'bg-olive-700 text-cream-50' : 'text-olive-600 hover:bg-olive-50'}`;
}

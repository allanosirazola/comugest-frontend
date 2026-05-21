import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { ProcedureStatusBadge } from '@/components/ProcedureStatusBadge';
import { useProcedure, useUpdateProcedure, useAddProcedureUpdate } from '@/hooks/useProcedures';
import { PROCEDURE_STATUSES } from '@/api/procedures';
import type { ProcedureStatus } from '@/types';

export function ProcedureDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: procedure, isLoading } = useProcedure(id);
  const updateProcedure = useUpdateProcedure(id ?? '');
  const addUpdate = useAddProcedureUpdate(id ?? '');

  const [message, setMessage] = useState('');
  const [resolution, setResolution] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  if (isLoading || !procedure) {
    return <Layout><p className="text-olive-600">{t('common.loading')}</p></Layout>;
  }

  const canManage = procedure.canManage === true;
  const backTo = canManage ? `/communities/${procedure.communityId}/procedures` : '/procedures';

  const onMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!message.trim()) return;
    await addUpdate.mutateAsync(message.trim());
    setMessage('');
  };

  const saveResolution = async (): Promise<void> => {
    await updateProcedure.mutateAsync({
      resolution: resolution.trim() || null,
      attachmentUrl: attachmentUrl.trim() || null,
    });
    setResolution('');
    setAttachmentUrl('');
  };

  return (
    <Layout>
      <Link to={backTo} className="text-sm text-olive-600 hover:text-olive-900">← {t('procedures.back')}</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ProcedureStatusBadge status={procedure.status} />
            <span className="text-xs uppercase tracking-wider text-olive-500">{t(`procedures.ty.${procedure.type}`)}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-medium text-olive-950">{procedure.subject}</h1>
          <p className="mt-1 text-xs text-olive-500">
            {procedure.requester ? `${procedure.requester.firstName} ${procedure.requester.lastName} · ` : ''}
            {procedure.community?.name} · {formatDate(procedure.createdAt)}
            {procedure.unit ? ` · ${procedure.unit.label}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Contenido + hilo */}
        <div>
          <div className="card">
            <p className="whitespace-pre-wrap text-sm text-olive-800">{procedure.description}</p>
          </div>

          {/* Resolución del admin */}
          {procedure.resolution && (
            <div className="card mt-4 border-olive-200 bg-olive-50">
              <p className="text-xs font-medium uppercase tracking-wider text-olive-600">{t('procedures.resolution')}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-olive-800">{procedure.resolution}</p>
              {procedure.attachmentUrl && (
                <a href={procedure.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm text-olive-700 underline underline-offset-4">
                  📎 {t('procedures.viewDocument')}
                </a>
              )}
            </div>
          )}

          {/* Hilo de comunicación */}
          <div className="mt-4 space-y-3">
            {procedure.updates?.map((u) => (
              <div key={u.id} className="card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-olive-900">
                    {u.author.firstName} {u.author.lastName}
                    {(u.author.role === 'ADMIN_FINCAS' || u.author.role === 'SUPPORT') && (
                      <span className="ml-2 text-xs text-olive-500">{t('procedures.administration')}</span>
                    )}
                  </span>
                  <span className="text-xs text-olive-400">{formatDate(u.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-olive-700">{u.body}</p>
              </div>
            ))}
          </div>

          {/* Nuevo mensaje */}
          {procedure.status !== 'COMPLETED' && procedure.status !== 'REJECTED' && (
            <form onSubmit={onMessage} className="card mt-4 space-y-3">
              <textarea className="input min-h-20" value={message} onChange={(e): void => setMessage(e.target.value)} placeholder={t('procedures.messagePlaceholder')} />
              <button type="submit" className="btn-primary ml-auto block py-1.5" disabled={addUpdate.isPending || !message.trim()}>
                {t('procedures.sendMessage')}
              </button>
            </form>
          )}
        </div>

        {/* Panel de gestión (admin) */}
        {canManage && (
          <aside className="space-y-4">
            <div className="card space-y-4">
              <h2 className="font-display text-lg text-olive-900">{t('procedures.manage')}</h2>
              <div>
                <label className="label">{t('procedures.statusLabel')}</label>
                <select
                  className="input"
                  value={procedure.status}
                  onChange={(e): void => void updateProcedure.mutate({ status: e.target.value as ProcedureStatus })}
                >
                  {PROCEDURE_STATUSES.map((s) => <option key={s} value={s}>{t(`procedures.st.${s}`)}</option>)}
                </select>
              </div>
            </div>

            <div className="card space-y-3">
              <h2 className="font-display text-sm text-olive-900">{t('procedures.addResolution')}</h2>
              <textarea className="input min-h-20" value={resolution} onChange={(e): void => setResolution(e.target.value)} placeholder={t('procedures.resolutionPlaceholder')} />
              <div>
                <label className="label">{t('procedures.documentUrl')}</label>
                <input type="url" className="input" value={attachmentUrl} onChange={(e): void => setAttachmentUrl(e.target.value)} placeholder="https://…" />
              </div>
              <button onClick={saveResolution} className="btn-primary w-full py-1.5" disabled={updateProcedure.isPending}>
                {t('common.save')}
              </button>
            </div>
          </aside>
        )}
      </div>
    </Layout>
  );
}

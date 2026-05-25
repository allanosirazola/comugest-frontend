import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useComms';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';

export function CommunityAnnouncementsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: community } = useCommunity(id);
  const { data: announcements, isLoading } = useCommunityAnnouncements(id);
  const createAnnouncement = useCreateAnnouncement(id ?? '');
  const deleteAnnouncement = useDeleteAnnouncement(id ?? '');

  const { data: templates = [] } = useTemplates(id);
  const createTemplate = useCreateTemplate(id ?? '');
  const deleteTemplate = useDeleteTemplate(id ?? '');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [notify, setNotify] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState(null);

  // Template UI state
  const [showTemplates, setShowTemplates] = useState(false);
  const [showManageTemplates, setShowManageTemplates] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveTemplateError, setSaveTemplateError] = useState(null);

  const templateDropdownRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createAnnouncement.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        pinned,
        notify,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setTitle('');
      setBody('');
      setPinned(false);
      setNotify(true);
      setExpiresAt('');
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm(t('announcements.confirmDelete'))) return;
    await deleteAnnouncement.mutateAsync(announcementId);
  };

  const applyTemplate = (tpl) => {
    setTitle(tpl.subject ?? tpl.title ?? '');
    setBody(tpl.body ?? '');
    setShowTemplates(false);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSaveTemplateError(null);
    try {
      await createTemplate.mutateAsync({ name: templateName.trim(), subject: title.trim(), body: body.trim() });
      setTemplateName('');
      setShowSaveTemplateModal(false);
    } catch (err) {
      setSaveTemplateError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm(t('templates.delete') + '?')) return;
    await deleteTemplate.mutateAsync(templateId);
  };

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('announcements.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('announcements.title')}</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? t('common.cancel') : `+ ${t('announcements.create')}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card mt-6 space-y-5">
          {/* Template toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={templateDropdownRef}>
              <button
                type="button"
                onClick={() => setShowTemplates((v) => !v)}
                className="btn-ghost text-sm"
              >
                📋 {t('templates.use')}
              </button>
              {showTemplates && (
                <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-olive-100 bg-white shadow-lg">
                  {templates.length === 0 ? (
                    <p className="p-4 text-sm text-olive-500">{t('templates.empty')}</p>
                  ) : (
                    <ul className="divide-y divide-olive-50">
                      {templates.map((tpl) => (
                        <li key={tpl.id} className="flex items-center justify-between gap-2 px-4 py-3">
                          <span className="text-sm text-olive-800 truncate">{tpl.name}</span>
                          <button
                            type="button"
                            onClick={() => applyTemplate(tpl)}
                            className="shrink-0 rounded-md bg-olive-700 px-2 py-1 text-xs text-white hover:bg-olive-800"
                          >
                            {t('templates.use')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowManageTemplates((v) => !v)}
              className="btn-ghost text-sm"
            >
              {t('templates.manage')}
            </button>
          </div>

          {/* Manage templates panel */}
          {showManageTemplates && (
            <div className="rounded-xl border border-olive-100 bg-cream-50 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-olive-500">{t('templates.title')}</p>
              {templates.length === 0 ? (
                <p className="text-sm text-olive-500">{t('templates.empty')}</p>
              ) : (
                <ul className="space-y-2">
                  {templates.map((tpl) => (
                    <li key={tpl.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-olive-800">{tpl.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="text-xs text-olive-500 hover:text-clay-600"
                      >
                        {t('templates.delete')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <label className="label" htmlFor="title">{t('announcements.titleField')}</label>
            <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div>
            <label className="label" htmlFor="body">{t('announcements.bodyField')}</label>
            <textarea id="body" className="input min-h-32" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-olive-700">
              <input type="checkbox" className="h-4 w-4 rounded border-olive-300 text-olive-700" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              {t('announcements.pin')}
            </label>
            <label className="flex items-center gap-2 text-sm text-olive-700">
              <input type="checkbox" className="h-4 w-4 rounded border-olive-300 text-olive-700" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              {t('announcements.notify')}
            </label>
          </div>
          <div>
            <label className="label" htmlFor="expires-at">
              {t('announcements.expiresAt') ?? 'Fecha de expiración'}{' '}
              <span className="text-olive-400 font-normal">({t('common.optional') ?? 'opcional'})</span>
            </label>
            <input
              id="expires-at"
              type="date"
              className="input w-auto"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          {error && (
            <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">{error}</div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={createAnnouncement.isPending}>
              {createAnnouncement.isPending ? t('common.loading') : t('announcements.publish')}
            </button>
            {title.trim() && body.trim() && (
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(true)}
                className="btn-ghost text-sm"
              >
                {t('templates.save')}
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
        {announcements && announcements.length === 0 && !showForm && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('announcements.empty')}</p>
          </div>
        )}
        {announcements?.map((a) => {
          const now = new Date();
          const isExpired = a.expiresAt ? new Date(a.expiresAt) < now : false;
          return (
            <article key={a.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {a.pinned && <span className="text-clay-500" title={t('announcements.pinned')}>📌</span>}
                    <h3 className="font-display text-xl font-medium text-olive-900">{a.title}</h3>
                    {a.expiresAt && (
                      isExpired ? (
                        <span className="rounded-full bg-clay-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-clay-700">
                          {t('announcements.badgeExpired') ?? 'EXPIRADO'}
                        </span>
                      ) : (
                        <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-olive-700">
                          {t('announcements.badgeActive') ?? 'ACTIVO'}
                        </span>
                      )
                    )}
                  </div>
                  <p className="mt-1 text-xs text-olive-500">
                    {a.author.firstName} {a.author.lastName} · {formatDate(a.publishedAt)}
                  </p>
                  {a.expiresAt && (
                    <p className="mt-0.5 text-xs text-olive-400">
                      {t('announcements.validUntil') ?? 'Válido hasta'}:{' '}
                      {new Date(a.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-xs text-olive-500 hover:text-clay-600">
                  {t('common.remove')}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-olive-700">{a.body}</p>
            </article>
          );
        })}
      </div>

      {/* Save as template modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-olive-950">{t('templates.save')}</h2>
              <button onClick={() => setShowSaveTemplateModal(false)} className="text-olive-400 hover:text-olive-700" aria-label={t('common.cancel')}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="label" htmlFor="tpl-name">{t('templates.name')}</label>
                <input
                  id="tpl-name"
                  className="input"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={t('templates.name')}
                />
              </div>
              {saveTemplateError && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">{saveTemplateError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={createTemplate.isPending}>
                  {createTemplate.isPending ? t('common.loading') : t('common.save')}
                </button>
                <button type="button" onClick={() => setShowSaveTemplateModal(false)} className="btn-ghost">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

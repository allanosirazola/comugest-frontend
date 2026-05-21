import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useComms';

export function CommunityAnnouncementsPage(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: community } = useCommunity(id);
  const { data: announcements, isLoading } = useCommunityAnnouncements(id);
  const createAnnouncement = useCreateAnnouncement(id ?? '');
  const deleteAnnouncement = useDeleteAnnouncement(id ?? '');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      await createAnnouncement.mutateAsync({ title: title.trim(), body: body.trim(), pinned, notify });
      setTitle('');
      setBody('');
      setPinned(false);
      setNotify(true);
      setShowForm(false);
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDelete = async (announcementId: string): Promise<void> => {
    if (!window.confirm(t('announcements.confirmDelete'))) return;
    await deleteAnnouncement.mutateAsync(announcementId);
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
        <button onClick={(): void => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? t('common.cancel') : `+ ${t('announcements.create')}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="title">{t('announcements.titleField')}</label>
            <input id="title" className="input" value={title} onChange={(e): void => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div>
            <label className="label" htmlFor="body">{t('announcements.bodyField')}</label>
            <textarea id="body" className="input min-h-32" value={body} onChange={(e): void => setBody(e.target.value)} required />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-olive-700">
              <input type="checkbox" className="h-4 w-4 rounded border-olive-300 text-olive-700" checked={pinned} onChange={(e): void => setPinned(e.target.checked)} />
              {t('announcements.pin')}
            </label>
            <label className="flex items-center gap-2 text-sm text-olive-700">
              <input type="checkbox" className="h-4 w-4 rounded border-olive-300 text-olive-700" checked={notify} onChange={(e): void => setNotify(e.target.checked)} />
              {t('announcements.notify')}
            </label>
          </div>
          {error && (
            <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">{error}</div>
          )}
          <button type="submit" className="btn-primary" disabled={createAnnouncement.isPending}>
            {createAnnouncement.isPending ? t('common.loading') : t('announcements.publish')}
          </button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
        {announcements && announcements.length === 0 && !showForm && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('announcements.empty')}</p>
          </div>
        )}
        {announcements?.map((a) => (
          <article key={a.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {a.pinned && <span className="text-clay-500" title={t('announcements.pinned')}>📌</span>}
                  <h3 className="font-display text-xl font-medium text-olive-900">{a.title}</h3>
                </div>
                <p className="mt-1 text-xs text-olive-500">
                  {a.author.firstName} {a.author.lastName} · {formatDate(a.publishedAt)}
                </p>
              </div>
              <button onClick={(): Promise<void> => handleDelete(a.id)} className="text-xs text-olive-500 hover:text-clay-600">
                {t('common.remove')}
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-olive-700">{a.body}</p>
          </article>
        ))}
      </div>
    </Layout>
  );
}

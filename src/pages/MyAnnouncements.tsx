import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { useMyAnnouncements } from '@/hooks/useComms';

export function MyAnnouncementsPage(): JSX.Element {
  const { t } = useTranslation();
  const { data: announcements, isLoading } = useMyAnnouncements();

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('announcements.boardEyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('announcements.boardTitle')}</h1>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
        {announcements && announcements.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('announcements.boardEmpty')}</p>
            <p className="mt-2 text-sm text-olive-600">{t('announcements.boardEmptyNote')}</p>
          </div>
        )}
        {announcements?.map((a) => (
          <article key={a.id} className="card">
            <div className="flex items-center gap-2">
              {a.pinned && <span className="text-clay-500">📌</span>}
              <h3 className="font-display text-xl font-medium text-olive-900">{a.title}</h3>
            </div>
            <p className="mt-1 text-xs text-olive-500">
              {a.community?.name} · {formatDate(a.publishedAt)}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-olive-700">{a.body}</p>
          </article>
        ))}
      </div>
    </Layout>
  );
}

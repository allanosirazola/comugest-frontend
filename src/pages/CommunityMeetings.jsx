import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityMeetings, useCreateMeeting } from '@/hooks/useMeetings';

const TYPE_COLORS = {
  ORDINARY: 'bg-olive-100 text-olive-800',
  EXTRAORDINARY: 'bg-cream-300 text-olive-800',
};

const STATUS_COLORS = {
  SCHEDULED: 'bg-cream-200 text-olive-700',
  HELD: 'bg-olive-100 text-olive-800',
  CANCELLED: 'bg-clay-500/20 text-clay-700',
};

function TypeBadge({ type }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'}`}>
      {t(`meetings.type${type}`)}
    </span>
  );
}

function MeetingStatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {t(`meetings.status${status}`)}
    </span>
  );
}

function formatDateTime(iso) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function CommunityMeetingsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';

  const { data: community } = useCommunity(id);
  const { data: meetings, isLoading } = useCommunityMeetings(id);
  const createMeeting = useCreateMeeting(id ?? '');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('ORDINARY');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [error, setError] = useState(null);

  const resetForm = () => {
    setTitle('');
    setType('ORDINARY');
    setScheduledAt('');
    setLocation('');
    setAgenda('');
    setError(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createMeeting.mutateAsync({
        title: title.trim(),
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        location: location.trim() || undefined,
        agenda: agenda.trim() || undefined,
      });
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('meetings.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('meetings.title')}</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
            {showForm ? t('common.cancel') : `+ ${t('meetings.newMeeting')}`}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={onSubmit} className="card mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="meet-title">{t('meetings.meetingTitle')}</label>
            <input
              id="meet-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="meet-type">{t('meetings.type')}</label>
              <select id="meet-type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="ORDINARY">{t('meetings.typeORDINARY')}</option>
                <option value="EXTRAORDINARY">{t('meetings.typeEXTRAORDINARY')}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="meet-date">{t('meetings.scheduledAt')}</label>
              <input
                id="meet-date"
                type="datetime-local"
                className="input"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="meet-location">{t('meetings.location')}</label>
            <input
              id="meet-location"
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={300}
            />
          </div>

          <div>
            <label className="label" htmlFor="meet-agenda">{t('meetings.agenda')}</label>
            <textarea
              id="meet-agenda"
              className="input min-h-28"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </div>

          {error && (
            <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={createMeeting.isPending}>
            {createMeeting.isPending ? t('common.loading') : t('meetings.create')}
          </button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}

        {meetings && meetings.length === 0 && !showForm && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('meetings.empty')}</p>
          </div>
        )}

        {meetings && meetings.length > 0 && meetings.map((meeting) => (
          <article
            key={meeting.id}
            className="card cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/communities/${id}/meetings/${meeting.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/communities/${id}/meetings/${meeting.id}`)}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={meeting.type} />
                <MeetingStatusBadge status={meeting.status} />
              </div>
              {meeting._count?.attendees != null && (
                <span className="text-xs text-olive-500">
                  {meeting._count.attendees} {t('meetings.attendeeCount')}
                </span>
              )}
            </div>

            <h2 className="mt-2 font-display text-xl font-medium text-olive-900">{meeting.title}</h2>

            <p className="mt-1 text-sm text-olive-600">
              {formatDateTime(meeting.scheduledAt)}
              {meeting.location ? ` · ${meeting.location}` : ''}
            </p>
          </article>
        ))}
      </div>
    </Layout>
  );
}

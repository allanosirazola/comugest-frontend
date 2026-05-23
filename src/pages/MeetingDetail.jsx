import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useMeeting, useUpdateMeeting, useUpdateAttendance, useSaveMinutes, usePublishMinutes, useGenerateQr } from '@/hooks/useMeetings';
import { usePolls, useCreatePoll, useClosePoll, useCastVote } from '@/hooks/usePolls';

const TYPE_COLORS = {
  ORDINARY: 'bg-olive-100 text-olive-800',
  EXTRAORDINARY: 'bg-cream-300 text-olive-800',
};

const STATUS_COLORS = {
  SCHEDULED: 'bg-cream-200 text-olive-700',
  HELD: 'bg-olive-100 text-olive-800',
  CANCELLED: 'bg-clay-500/20 text-clay-700',
};

const ATTENDANCE_COLORS = {
  PENDING: 'bg-cream-200 text-olive-700',
  CONFIRMED: 'bg-olive-100 text-olive-800',
  DECLINED: 'bg-clay-500/20 text-clay-700',
  DELEGATED: 'bg-cream-300 text-olive-800',
};

const ATTENDANCE_ICONS = {
  PENDING: '⏳',
  CONFIRMED: '✓',
  DECLINED: '✗',
  DELEGATED: '→',
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

function AttendanceBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ATTENDANCE_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
      <span aria-hidden="true">{ATTENDANCE_ICONS[status]}</span>
      {t(`meetings.attendance${status}`)}
    </span>
  );
}

function formatDateTime(iso) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const MEETING_STATUSES = ['SCHEDULED', 'HELD', 'CANCELLED'];
const ATTENDANCE_STATUSES = ['PENDING', 'CONFIRMED', 'DECLINED', 'DELEGATED'];

export function MeetingDetailPage() {
  const { t } = useTranslation();
  const { id, meetingId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';

  const { data: meeting, isLoading } = useMeeting(meetingId);
  const updateMeeting = useUpdateMeeting(meetingId ?? '');
  const updateAttendance = useUpdateAttendance(meetingId ?? '');
  const saveMinutesMutation = useSaveMinutes(meetingId ?? '');
  const publishMinutesMutation = usePublishMinutes(meetingId ?? '');
  const generateQr = useGenerateQr(meetingId ?? '');

  const [qrData, setQrData] = useState(null);
  const [qrError, setQrError] = useState(null);

  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [proxy, setProxy] = useState('');
  const [attendanceError, setAttendanceError] = useState(null);

  const [adminStatus, setAdminStatus] = useState('');
  const [minutes, setMinutes] = useState('');
  const [minutesUrl, setMinutesUrl] = useState('');
  const [adminError, setAdminError] = useState(null);

  if (isLoading || !meeting) {
    return <Layout><p className="text-olive-600">{t('common.loading')}</p></Layout>;
  }

  const myAttendance = meeting.attendees?.find((a) => a.user?.id === user?.id);
  const currentAttendanceStatus = attendanceStatus ?? myAttendance?.status ?? 'PENDING';

  const onSaveAttendance = async () => {
    setAttendanceError(null);
    try {
      await updateAttendance.mutateAsync({
        status: currentAttendanceStatus,
        proxy: currentAttendanceStatus === 'DELEGATED' ? proxy.trim() || undefined : undefined,
      });
      setAttendanceStatus(null);
    } catch (err) {
      setAttendanceError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const onSaveAdminChanges = async () => {
    setAdminError(null);
    try {
      await updateMeeting.mutateAsync({
        status: adminStatus || undefined,
        minutes: minutes.trim() || undefined,
        minutesUrl: minutesUrl.trim() || undefined,
      });
      setAdminStatus('');
      setMinutes('');
      setMinutesUrl('');
    } catch (err) {
      setAdminError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const onMarkHeld = async () => {
    setAdminError(null);
    try {
      await updateMeeting.mutateAsync({ status: 'HELD' });
    } catch (err) {
      setAdminError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${id}/meetings`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('meetings.backToList')}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={meeting.type} />
            <MeetingStatusBadge status={meeting.status} />
          </div>
          <h1 className="mt-2 font-display text-3xl font-medium text-olive-950">{meeting.title}</h1>
          <p className="mt-1 text-sm text-olive-600">
            {formatDateTime(meeting.scheduledAt)}
            {meeting.location ? ` · ${meeting.location}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {meeting.agenda && (
            <div className="card">
              <p className="text-xs font-medium uppercase tracking-wider text-olive-600">{t('meetings.agenda')}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-olive-800">{meeting.agenda}</p>
            </div>
          )}

          {(isAdmin || meeting.minutesPublished) && (meeting.minutes || meeting.minutesUrl) && (
            <div className="card border-olive-200 bg-olive-50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-olive-600">{t('meetings.minutes')}</p>
                {meeting.minutesPublished && (
                  <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-olive-700">
                    {t('meetings.minutesPublished')}
                  </span>
                )}
              </div>
              {meeting.minutes && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-olive-800">{meeting.minutes}</p>
              )}
              {meeting.minutesUrl && (
                <a
                  href={meeting.minutesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm text-olive-700 underline underline-offset-4"
                >
                  📎 {t('meetings.minutesUrl')}
                </a>
              )}
              {meeting.minutesUpdatedAt && (
                <p className="mt-2 text-xs text-olive-400">
                  {t('meetings.minutesLastUpdated', { date: new Date(meeting.minutesUpdatedAt).toLocaleString() })}
                </p>
              )}
            </div>
          )}

          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="card overflow-x-auto p-0">
              <div className="border-b border-olive-100 px-4 py-3">
                <h2 className="font-display text-lg font-medium text-olive-900">{t('meetings.attendees')}</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                    <th className="px-4 py-3">{t('invite.firstName')} {t('invite.lastName')}</th>
                    <th className="px-4 py-3">{t('meetings.status')}</th>
                    <th className="px-4 py-3">{t('meetings.proxy')}</th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.attendees.map((a) => (
                    <tr key={a.id} className="border-b border-olive-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-olive-900">
                        {a.user ? `${a.user.firstName} ${a.user.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <AttendanceBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-olive-600">
                        {a.status === 'DELEGATED' ? (a.proxy ?? '—') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {!isAdmin && (
            <div className="card space-y-4">
              <h2 className="font-display text-lg text-olive-900">{t('meetings.myAttendance')}</h2>

              <div className="flex flex-col gap-2">
                {ATTENDANCE_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setAttendanceStatus(s);
                      if (s !== 'DELEGATED') setProxy('');
                    }}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      currentAttendanceStatus === s
                        ? 'border-olive-700 bg-olive-700 text-cream-50'
                        : 'border-olive-200 text-olive-700 hover:bg-olive-50'
                    }`}
                  >
                    <span aria-hidden="true" className="mr-1">{ATTENDANCE_ICONS[s]}</span>
                    {t(`meetings.attendance${s}`)}
                  </button>
                ))}
              </div>

              {currentAttendanceStatus === 'DELEGATED' && (
                <div>
                  <label className="label" htmlFor="proxy-name">{t('meetings.proxy')}</label>
                  <input
                    id="proxy-name"
                    className="input"
                    value={proxy}
                    onChange={(e) => setProxy(e.target.value)}
                    placeholder={t('meetings.proxy')}
                    maxLength={200}
                  />
                </div>
              )}

              {attendanceError && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                  {attendanceError}
                </div>
              )}

              <button
                type="button"
                onClick={onSaveAttendance}
                className="btn-primary w-full py-1.5"
                disabled={updateAttendance.isPending}
              >
                {updateAttendance.isPending ? t('common.loading') : t('common.save')}
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="card space-y-4">
              <h2 className="font-display text-lg text-olive-900">{t('meetings.editMeeting')}</h2>

              <div>
                <label className="label" htmlFor="admin-status">{t('meetings.status')}</label>
                <select
                  id="admin-status"
                  className="input"
                  value={adminStatus || meeting.status}
                  onChange={(e) => setAdminStatus(e.target.value)}
                >
                  {MEETING_STATUSES.map((s) => (
                    <option key={s} value={s}>{t(`meetings.status${s}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="admin-minutes">{t('meetings.minutes')}</label>
                <textarea
                  id="admin-minutes"
                  className="input min-h-24"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder={meeting.minutes ?? ''}
                />
              </div>

              <div>
                <label className="label" htmlFor="admin-minutes-url">{t('meetings.minutesUrl')}</label>
                <input
                  id="admin-minutes-url"
                  type="url"
                  className="input"
                  value={minutesUrl}
                  onChange={(e) => setMinutesUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>

              {adminError && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                  {adminError}
                </div>
              )}

              <button
                type="button"
                onClick={onSaveAdminChanges}
                className="btn-primary w-full py-1.5"
                disabled={updateMeeting.isPending}
              >
                {updateMeeting.isPending ? t('common.loading') : t('meetings.saveChanges')}
              </button>

              {meeting.status === 'SCHEDULED' && (
                <button
                  type="button"
                  onClick={onMarkHeld}
                  className="w-full rounded-md border border-olive-700 px-4 py-1.5 text-sm font-medium text-olive-700 transition-colors hover:bg-olive-50 disabled:opacity-50"
                  disabled={updateMeeting.isPending}
                >
                  {t('meetings.markHeld')}
                </button>
              )}

              {meeting.minutes && (
                <button
                  type="button"
                  onClick={() => publishMinutesMutation.mutate(!meeting.minutesPublished)}
                  disabled={publishMinutesMutation.isPending}
                  className={`w-full py-1.5 text-sm ${meeting.minutesPublished ? 'btn-ghost text-clay-600' : 'btn-primary'}`}
                >
                  {meeting.minutesPublished ? t('meetings.minutesUnpublish') : t('meetings.minutesPublish')}
                </button>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="card space-y-3">
              <h2 className="font-display text-lg text-olive-900">{t('meetings.qrTitle')}</h2>
              <p className="text-xs text-olive-500">{t('meetings.qrDesc')}</p>
              <button
                type="button"
                className="btn-primary w-full py-1.5"
                onClick={async () => {
                  setQrError(null);
                  try {
                    const data = await generateQr.mutateAsync();
                    setQrData(data);
                  } catch (err) {
                    setQrError(err?.response?.data?.error?.message ?? t('errors.generic'));
                  }
                }}
                disabled={generateQr.isPending}
              >
                {generateQr.isPending ? t('common.loading') : t('meetings.qrGenerate')}
              </button>
              {qrError && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                  {qrError}
                </div>
              )}
              {qrData && (
                <div className="space-y-2">
                  {qrData.qrDataUrl && (
                    <img
                      src={qrData.qrDataUrl}
                      alt="QR de asistencia"
                      className="mx-auto w-48 rounded-md border border-olive-200"
                    />
                  )}
                  {qrData.url && (
                    <p className="break-all rounded-md bg-cream-100 px-3 py-2 text-xs text-olive-700">
                      {qrData.url}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      <PollsSection meetingId={meetingId} />
    </Layout>
  );
}

function PollsSection({ meetingId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';
  const { data: polls = [] } = usePolls(meetingId);
  const createPoll = useCreatePoll(meetingId);
  const closePoll = useClosePoll(meetingId);
  const castVote = useCastVote(meetingId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', description: '', votingDeadline: '', requiresAttendance: false });
  const [error, setError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createPoll.mutateAsync({
        question: form.question,
        description: form.description || undefined,
        votingDeadline: form.votingDeadline || undefined,
        requiresAttendance: form.requiresAttendance,
      });
      setShowForm(false);
      setForm({ question: '', description: '', votingDeadline: '', requiresAttendance: false });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleVote = async (pollId, option) => {
    try {
      await castVote.mutateAsync({ pollId, option });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const VOTE_OPTIONS = ['FAVOR', 'CONTRA', 'ABSTENCION'];
  const VOTE_COLORS = {
    FAVOR: 'bg-green-100 text-green-800 hover:bg-green-200',
    CONTRA: 'bg-clay-100 text-clay-800 hover:bg-clay-200',
    ABSTENCION: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  };
  const VOTE_ACTIVE = {
    FAVOR: 'ring-2 ring-green-500',
    CONTRA: 'ring-2 ring-clay-500',
    ABSTENCION: 'ring-2 ring-gray-500',
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-olive-900">{t('polls.title')}</h2>
        {isAdmin && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
            {showForm ? t('common.cancel') : `+ ${t('polls.addPoll')}`}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-4 grid gap-3">
          <input
            className="input"
            placeholder={t('polls.fieldQuestion')}
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
          <textarea
            className="input"
            placeholder={t('polls.fieldDescription')}
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-olive-600">{t('polls.votingDeadline')}</label>
              <input
                type="datetime-local"
                className="input"
                value={form.votingDeadline}
                onChange={(e) => setForm({ ...form, votingDeadline: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-olive-700 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={form.requiresAttendance}
                onChange={(e) => setForm({ ...form, requiresAttendance: e.target.checked })}
                className="rounded border-olive-300"
              />
              {t('polls.requiresAttendance')}
            </label>
          </div>
          <button type="submit" className="btn-primary w-fit" disabled={createPoll.isPending}>
            {createPoll.isPending ? t('common.loading') : t('polls.addPoll')}
          </button>
        </form>
      )}

      {error && (
        <div role="alert" className="mt-3 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {error}
        </div>
      )}

      {polls.length === 0 ? (
        <p className="mt-6 text-sm text-olive-500">{t('polls.empty')}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {polls.map((poll) => {
            const total = (poll.results?.FAVOR ?? 0) + (poll.results?.CONTRA ?? 0) + (poll.results?.ABSTENCION ?? 0);
            return (
              <div key={poll.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-olive-900">{poll.question}</p>
                    {poll.description && <p className="mt-0.5 text-sm text-olive-600">{poll.description}</p>}
                    {poll.votingDeadline && (
                      <p className="mt-0.5 text-xs text-olive-500">
                        {t('polls.deadline')}: {new Date(poll.votingDeadline).toLocaleString()}
                      </p>
                    )}
                    {poll.requiresAttendance && (
                      <p className="mt-0.5 text-xs text-olive-500">{t('polls.requiresAttendance')}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${poll.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {t(`polls.status.${poll.status.toLowerCase()}`)}
                    </span>
                    {poll.status === 'CLOSED' && poll.quorumReached !== null && poll.quorumReached !== undefined && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${poll.quorumReached ? 'bg-olive-100 text-olive-800' : 'bg-clay-100 text-clay-700'}`}>
                        {poll.quorumReached ? t('polls.quorumReached') : t('polls.quorumNotReached')}
                      </span>
                    )}
                    {isAdmin && poll.status === 'OPEN' && (
                      <button
                        onClick={() => closePoll.mutate(poll.id)}
                        className="text-xs text-olive-500 hover:text-clay-600"
                      >
                        {t('polls.close')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Vote buttons */}
                {poll.status === 'OPEN' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {VOTE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleVote(poll.id, opt)}
                        disabled={castVote.isPending}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${VOTE_COLORS[opt]} ${poll.myVote === opt ? VOTE_ACTIVE[opt] : ''}`}
                      >
                        {t(`polls.option.${opt.toLowerCase()}`)}
                        {poll.results?.[opt] > 0 && ` (${poll.results[opt]})`}
                      </button>
                    ))}
                    {total > 0 && <span className="self-center text-xs text-olive-500">{t('polls.totalVotes', { count: total })}</span>}
                  </div>
                )}

                {/* Results for closed polls */}
                {poll.status === 'CLOSED' && (
                  <div className="mt-3 space-y-1">
                    <div className="flex flex-wrap gap-4 text-sm">
                      {VOTE_OPTIONS.map((opt) => (
                        <span key={opt} className="text-olive-700">
                          <span className="font-medium">{t(`polls.option.${opt.toLowerCase()}`)}</span>: {poll.results?.[opt] ?? 0}
                        </span>
                      ))}
                      <span className="text-olive-500">{t('polls.totalVotes', { count: total })}</span>
                    </div>
                    {(poll.results?.telematic > 0 || poll.results?.inPerson > 0) && (
                      <p className="text-xs text-olive-400">
                        {t('polls.telematic')}: {poll.results?.telematic ?? 0} · {t('polls.inPerson')}: {poll.results?.inPerson ?? 0}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

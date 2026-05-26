import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAreas, useReservations, useCreateReservation, useCancelReservation } from '@/hooks/useAreas';
import { useMyWaitlist, useJoinWaitlist, useLeaveWaitlist } from '@/hooks/useWaitlist';

const ADMIN_ROLES = ['ADMIN_FINCAS', 'SUPPORT'];

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildSlots(openTime, closeTime, slotMinutes) {
  const slots = [];
  const start = toMinutes(openTime);
  const end = toMinutes(closeTime);
  let cursor = start;
  while (cursor + slotMinutes <= end) {
    slots.push({
      startTime: fromMinutes(cursor),
      endTime: fromMinutes(cursor + slotMinutes),
    });
    cursor += slotMinutes;
  }
  return slots;
}

function slotStartMatchesReservation(slotStartTime, date, reservation) {
  // reservation.startAt is an ISO datetime string; compare its time portion
  const resDate = new Date(reservation.startAt);
  const resHours = String(resDate.getUTCHours()).padStart(2, '0');
  const resMins = String(resDate.getUTCMinutes()).padStart(2, '0');
  const resTime = `${resHours}:${resMins}`;
  return resTime === slotStartTime;
}

export function AreaReservationsPage() {
  const { t } = useTranslation();
  const { communityId, areaId } = useParams();
  const { user } = useAuth();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  const { data: areasData, isLoading: areasLoading } = useAreas(communityId);
  const area = areasData?.areas?.find((a) => a.id === areaId);

  const { data: reservationsData, isLoading: resLoading } = useReservations(communityId, areaId, date);
  const createReservation = useCreateReservation(communityId, areaId, date);
  const cancelReservation = useCancelReservation(areaId, date);

  const [confirmSlot, setConfirmSlot] = useState(null); // { startTime, endTime }
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState(null);
  const [waitlistConflictSlot, setWaitlistConflictSlot] = useState(null); // slot that had 409 conflict
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null); // reservation object

  const joinWaitlist = useJoinWaitlist();
  const leaveWaitlist = useLeaveWaitlist();
  const { data: myWaitlist = [] } = useMyWaitlist();

  const handleReserve = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      // Build startAt as ISO string from date + slotStartTime
      const startAt = new Date(`${date}T${confirmSlot.startTime}:00.000Z`).toISOString();
      await createReservation.mutateAsync({ areaId, startAt, notes: notes.trim() || undefined });
      setConfirmSlot(null);
      setNotes('');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        // Slot conflict: offer waitlist
        setWaitlistConflictSlot(confirmSlot);
        setConfirmSlot(null);
        setNotes('');
      } else {
        setModalError(err?.response?.data?.error?.message ?? t('errors.generic'));
      }
    }
  };

  const handleJoinWaitlist = async () => {
    if (!waitlistConflictSlot) return;
    try {
      const startTime = new Date(`${date}T${waitlistConflictSlot.startTime}:00.000Z`).toISOString();
      const endTime = new Date(`${date}T${waitlistConflictSlot.endTime}:00.000Z`).toISOString();
      await joinWaitlist.mutateAsync({ areaId, startTime, endTime });
      setWaitlistConflictSlot(null);
      setWaitlistSuccess(true);
      setTimeout(() => setWaitlistSuccess(false), 3000);
    } catch {
      // dismiss silently — user can retry
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    await cancelReservation.mutateAsync(cancelTarget.id);
    setCancelTarget(null);
  };

  const slots = area ? buildSlots(area.openTime, area.closeTime, area.slotMinutes) : [];
  const reservations = reservationsData?.reservations ?? [];

  const isLoading = areasLoading || resLoading;

  return (
    <Layout>
      <Link
        to={`/communities/${communityId}/areas`}
        className="text-sm text-olive-600 hover:text-olive-900"
      >
        ← {t('areas.backToAreas')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('areas.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">
            {area?.name ?? t('areas.reservationsTitle')}
          </h1>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label className="label mb-0 shrink-0" htmlFor="res-date">{t('areas.selectDate')}</label>
        <input
          id="res-date"
          type="date"
          className="input max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}

        {!isLoading && !area && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('areas.empty')}</p>
          </div>
        )}

        {!isLoading && area && slots.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('areas.noSlots')}</p>
          </div>
        )}

        {!isLoading && area && slots.length > 0 && (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                  <th className="px-4 py-3 w-28">Hora</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => {
                  const reservation = reservations.find((r) =>
                    slotStartMatchesReservation(slot.startTime, date, r)
                  );
                  const isOwn = reservation && user && reservation.user?.id === user.id;
                  const canCancel = reservation && (isOwn || isAdmin);

                  return (
                    <tr key={slot.startTime} className="border-b border-olive-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-olive-700">
                        {slot.startTime}–{slot.endTime}
                      </td>
                      <td className="px-4 py-3">
                        {reservation ? (
                          <span className="text-olive-900">
                            <span className="mr-1 text-xs uppercase tracking-wider text-olive-500">{t('areas.bookedBy')}</span>
                            {reservation.user
                              ? `${reservation.user.firstName} ${reservation.user.lastName}`
                              : '—'}
                          </span>
                        ) : (
                          <span className="text-xs uppercase tracking-wider text-olive-400">{t('areas.free')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!reservation && (
                          <button
                            onClick={() => { setConfirmSlot(slot); setNotes(''); setModalError(null); }}
                            className="btn-primary text-xs"
                          >
                            {t('areas.reserve')}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => setCancelTarget(reservation)}
                            className="text-xs text-olive-500 hover:text-clay-600"
                          >
                            {t('areas.cancel')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reserve modal */}
      {confirmSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 font-display text-xl font-medium text-olive-950">{t('areas.confirm')}</h2>
            <p className="mb-4 text-sm text-olive-600">
              {confirmSlot.startTime}–{confirmSlot.endTime} · {date}
            </p>
            <form onSubmit={handleReserve} className="space-y-4">
              <div>
                <label className="label" htmlFor="res-notes">{t('areas.notes')}</label>
                <input
                  id="res-notes"
                  className="input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('areas.notes')}
                />
              </div>
              {modalError && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                  {modalError}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="text-sm text-olive-600 hover:text-olive-900"
                  onClick={() => setConfirmSlot(null)}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={createReservation.isPending}>
                  {createReservation.isPending ? t('common.loading') : t('areas.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 font-display text-xl font-medium text-olive-950">{t('areas.confirmCancel')}</h2>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="text-sm text-olive-600 hover:text-olive-900"
                onClick={() => setCancelTarget(null)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={cancelReservation.isPending}
                onClick={handleCancel}
              >
                {cancelReservation.isPending ? t('common.loading') : t('areas.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist conflict modal */}
      {waitlistConflictSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 font-display text-xl font-medium text-olive-950">{t('areas.slotTaken')}</h2>
            <p className="mb-4 text-sm text-olive-600">{t('areas.joinWaitlistPrompt')}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="text-sm text-olive-600 hover:text-olive-900"
                onClick={() => setWaitlistConflictSlot(null)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={joinWaitlist.isPending}
                onClick={handleJoinWaitlist}
              >
                {joinWaitlist.isPending ? t('common.loading') : t('areas.joinWaitlist')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist success toast */}
      {waitlistSuccess && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-olive-700 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {t('areas.waitlistJoined')}
        </div>
      )}

      {/* My waitlist entries for this area */}
      {myWaitlist.filter((e) => e.areaId === areaId).length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl text-olive-900">{t('areas.myWaitlist')}</h2>
          <div className="card mt-3 overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                  <th className="px-4 py-3">{t('areas.selectDate')}</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {myWaitlist.filter((e) => e.areaId === areaId).map((entry) => (
                  <tr key={entry.id} className="border-b border-olive-50 last:border-0">
                    <td className="px-4 py-3 text-olive-700">
                      {new Date(entry.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-olive-700">
                      {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      –{new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => leaveWaitlist.mutate(entry.id)}
                        className="text-xs text-olive-500 hover:text-clay-600"
                        disabled={leaveWaitlist.isPending}
                      >
                        {t('areas.leaveWaitlist')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

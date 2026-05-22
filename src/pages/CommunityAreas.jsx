import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunities';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea } from '@/hooks/useAreas';

const ADMIN_ROLES = ['ADMIN_FINCAS', 'SUPPORT'];

const SLOT_OPTIONS = [
  { value: 30, labelKey: 'areas.slot30' },
  { value: 60, labelKey: 'areas.slot60' },
  { value: 120, labelKey: 'areas.slot120' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  capacity: '',
  openTime: '08:00',
  closeTime: '22:00',
  slotMinutes: 60,
  maxSlotsPerDay: 1,
};

export function CommunityAreasPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const { data: community } = useCommunity(id);
  const { data, isLoading } = useAreas(id);
  const createArea = useCreateArea(id ?? '');
  const updateArea = useUpdateArea(id ?? '');
  const deleteArea = useDeleteArea(id ?? '');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createArea.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || null,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        openTime: form.openTime,
        closeTime: form.closeTime,
        slotMinutes: parseInt(form.slotMinutes, 10),
        maxSlotsPerDay: parseInt(form.maxSlotsPerDay, 10),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleToggleActive = async (area) => {
    if (area.active) {
      if (!window.confirm(`${t('areas.deactivate')} "${area.name}"?`)) return;
      await deleteArea.mutateAsync(area.id);
    } else {
      await updateArea.mutateAsync({ id: area.id, input: { active: true } });
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('areas.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('areas.title')}</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
            {showForm ? t('common.cancel') : `+ ${t('areas.newArea')}`}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={onSubmit} className="card mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="area-name">{t('areas.name')}</label>
              <input
                id="area-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="area-capacity">{t('areas.capacity')}</label>
              <input
                id="area-capacity"
                type="number"
                min="1"
                className="input"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="—"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="area-description">{t('areas.description')}</label>
            <input
              id="area-description"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="area-openTime">{t('areas.openTime')}</label>
              <input
                id="area-openTime"
                type="time"
                className="input"
                value={form.openTime}
                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="area-closeTime">{t('areas.closeTime')}</label>
              <input
                id="area-closeTime"
                type="time"
                className="input"
                value={form.closeTime}
                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="area-slotMinutes">{t('areas.slotMinutes')}</label>
              <select
                id="area-slotMinutes"
                className="input"
                value={form.slotMinutes}
                onChange={(e) => setForm({ ...form, slotMinutes: parseInt(e.target.value, 10) })}
              >
                {SLOT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="area-maxSlotsPerDay">{t('areas.maxSlotsPerDay')}</label>
              <input
                id="area-maxSlotsPerDay"
                type="number"
                min="1"
                max="10"
                className="input"
                value={form.maxSlotsPerDay}
                onChange={(e) => setForm({ ...form, maxSlotsPerDay: e.target.value })}
                required
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={createArea.isPending}>
            {createArea.isPending ? t('common.loading') : t('areas.save')}
          </button>
        </form>
      )}

      <div className="mt-8">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}

        {data && data.areas.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('areas.empty')}</p>
          </div>
        )}

        {data && data.areas.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.areas.map((area) => (
              <div
                key={area.id}
                className={`card flex flex-col gap-3 ${!area.active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-medium text-olive-950">{area.name}</h2>
                  <span className="shrink-0 rounded-full bg-olive-100 px-2 py-0.5 text-xs text-olive-700">
                    {area.todayConfirmedCount ?? 0} {t('areas.todayCount')}
                  </span>
                </div>

                {area.description && (
                  <p className="text-sm text-olive-600">{area.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-olive-500">
                  {area.capacity != null && (
                    <span>👥 {area.capacity}</span>
                  )}
                  <span>🕐 {area.openTime}–{area.closeTime}</span>
                  <span>⏱ {area.slotMinutes} min</span>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Link
                    to={`/communities/${id}/areas/${area.id}/reservations`}
                    className="btn-primary text-sm"
                  >
                    {t('areas.viewReservations')}
                  </Link>

                  {isAdmin && (
                    <button
                      onClick={() => handleToggleActive(area)}
                      className="text-sm text-olive-500 hover:text-clay-600"
                      disabled={updateArea.isPending || deleteArea.isPending}
                    >
                      {area.active ? t('areas.deactivate') : t('areas.activate')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

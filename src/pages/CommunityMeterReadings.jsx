import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useMeterReadings, useCreateReading, useDeleteReading } from '@/hooks/useMeterReadings';
import { useCommunity } from '@/hooks/useCommunities';

const METER_TYPES = ['AGUA', 'LUZ', 'GAS', 'OTRO'];

const TYPE_COLORS = {
  AGUA: 'bg-blue-100 text-blue-800',
  LUZ: 'bg-yellow-100 text-yellow-800',
  GAS: 'bg-orange-100 text-orange-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

export function CommunityMeterReadingsPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const { data: community } = useCommunity(communityId);
  const [filterType, setFilterType] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const { data: readings = [], isLoading } = useMeterReadings(communityId, {
    ...(filterType && { type: filterType }),
    ...(filterUnit && { unitId: filterUnit }),
  });
  const createReading = useCreateReading(communityId);
  const deleteReading = useDeleteReading(communityId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    unitId: '',
    type: 'AGUA',
    readingDate: new Date().toISOString().slice(0, 10),
    value: '',
    notes: '',
  });
  const [actionError, setActionError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createReading.mutateAsync({ ...form, value: parseFloat(form.value) });
      setShowForm(false);
      setForm({ unitId: '', type: 'AGUA', readingDate: new Date().toISOString().slice(0, 10), value: '', notes: '' });
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('meters.confirmDelete'))) return;
    try {
      await deleteReading.mutateAsync(id);
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const units = community?.units ?? [];

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToDetail')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('meters.eyebrow')}</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('meters.title')}</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? t('common.cancel') : `+ ${t('meters.addReading')}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 grid gap-3 sm:grid-cols-2">
          <select
            className="input"
            value={form.unitId}
            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
            required
          >
            <option value="">{t('meters.selectUnit')}</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.type} {u.label}</option>
            ))}
          </select>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {METER_TYPES.map((mt) => (
              <option key={mt} value={mt}>{t(`meters.type.${mt.toLowerCase()}`)}</option>
            ))}
          </select>
          <input
            type="date"
            className="input"
            value={form.readingDate}
            onChange={(e) => setForm({ ...form, readingDate: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.001"
            className="input font-mono"
            placeholder={t('meters.fieldValue')}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            required
          />
          <input
            className="input sm:col-span-2"
            placeholder={t('meters.fieldNotes')}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button type="submit" className="btn-primary w-fit" disabled={createReading.isPending}>
            {createReading.isPending ? t('common.loading') : t('meters.addReading')}
          </button>
        </form>
      )}

      {actionError && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select className="input w-auto" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">{t('meters.allTypes')}</option>
          {METER_TYPES.map((mt) => (
            <option key={mt} value={mt}>{t(`meters.type.${mt.toLowerCase()}`)}</option>
          ))}
        </select>
        <select className="input w-auto" value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}>
          <option value="">{t('meters.allUnits')}</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.type} {u.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="mt-6 text-olive-600">{t('common.loading')}</p>
      ) : readings.length === 0 ? (
        <p className="mt-10 text-center text-olive-500">{t('meters.empty')}</p>
      ) : (
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                <th className="px-4 py-3">{t('meters.colUnit')}</th>
                <th className="px-4 py-3">{t('meters.colType')}</th>
                <th className="px-4 py-3">{t('meters.colDate')}</th>
                <th className="px-4 py-3 text-right">{t('meters.colValue')}</th>
                <th className="px-4 py-3 text-right">{t('meters.colConsumption')}</th>
                <th className="px-4 py-3">{t('meters.colNotes')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id} className="border-b border-olive-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-olive-900">
                    {r.unit?.type} {r.unit?.label}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${TYPE_COLORS[r.type]}`}>
                      {t(`meters.type.${r.type.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-olive-700">
                    {new Date(r.readingDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-olive-900">
                    {parseFloat(r.value).toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-olive-600">
                    {r.consumption != null ? parseFloat(r.consumption).toFixed(3) : '—'}
                  </td>
                  <td className="px-4 py-3 text-olive-600 text-xs">{r.notes ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-olive-500 hover:text-clay-600"
                      aria-label={t('common.remove')}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

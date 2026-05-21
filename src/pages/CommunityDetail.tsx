import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import {
  useCommunity,
  useCreateUnit,
  useDeleteUnit,
  useDeleteCommunity,
} from '@/hooks/useCommunities';
import type { UnitType } from '@/types';

export function CommunityDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: community, isLoading } = useCommunity(id);
  const createUnit = useCreateUnit(id ?? '');
  const deleteUnit = useDeleteUnit(id ?? '');
  const deleteCommunity = useDeleteCommunity();

  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({
    type: 'VIVIENDA' as UnitType,
    label: '',
    floor: '',
    door: '',
    coefficient: '',
    surfaceM2: '',
  });
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading || !community) {
    return (
      <Layout>
        <p className="text-olive-600">{t('common.loading')}</p>
      </Layout>
    );
  }

  const coefSum = community.units.reduce((acc, u) => acc + parseFloat(u.coefficient), 0);

  const handleAddUnit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setActionError(null);
    try {
      await createUnit.mutateAsync({
        type: newUnit.type,
        label: newUnit.label.trim(),
        floor: newUnit.floor.trim() || null,
        door: newUnit.door.trim() || null,
        coefficient: parseFloat(newUnit.coefficient) || 0,
        surfaceM2: newUnit.surfaceM2 ? parseFloat(newUnit.surfaceM2) : null,
      });
      setShowNewUnit(false);
      setNewUnit({ type: 'VIVIENDA', label: '', floor: '', door: '', coefficient: '', surfaceM2: '' });
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setActionError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDeleteUnit = async (unitId: string): Promise<void> => {
    if (!window.confirm(t('communities.confirmDeleteUnit'))) return;
    setActionError(null);
    try {
      await deleteUnit.mutateAsync(unitId);
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setActionError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDeleteCommunity = async (): Promise<void> => {
    if (!window.confirm(t('communities.confirmDeleteCommunity'))) return;
    try {
      await deleteCommunity.mutateAsync(community.id);
      navigate('/communities', { replace: true });
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setActionError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <Link to="/communities" className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('communities.eyebrow')}</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{community.name}</h1>
          <p className="mt-2 text-sm text-olive-600">
            {community.address} · {community.postalCode} {community.city}
          </p>
          {community.cif && (
            <p className="mt-0.5 text-xs text-olive-500">CIF: {community.cif}</p>
          )}
        </div>
        <button onClick={handleDeleteCommunity} className="btn-ghost text-xs text-clay-600 hover:bg-clay-400/10">
          {t('communities.deleteCommunity')}
        </button>
      </div>

      {/* Resumen */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label={t('communities.statUnits')} value={String(community.units.length)} />
        <StatCard label={t('communities.statCoef')} value={`${coefSum.toFixed(2)} / 100`} />
        <StatCard label={t('communities.statAdmins')} value={String(community.admins.length)} />
      </div>

      {/* Accesos rápidos */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to={`/communities/${community.id}/invoices`} className="btn-ghost">
          {t('communities.linkInvoices')}
        </Link>
        <Link to={`/communities/${community.id}/announcements`} className="btn-ghost">
          {t('communities.linkAnnouncements')}
        </Link>
        <Link to={`/communities/${community.id}/expenses`} className="btn-ghost">
          {t('communities.linkExpenses')}
        </Link>
        <Link to={`/communities/${community.id}/procedures`} className="btn-ghost">
          {t('communities.linkProcedures')}
        </Link>
        <Link to={`/communities/${community.id}/morosos`} className="btn-ghost">
          {t('communities.linkMorosos')}
        </Link>
      </div>

      {/* Unidades */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-olive-900">{t('communities.unitsTitle')}</h2>
          <button onClick={(): void => setShowNewUnit((v) => !v)} className="btn-primary">
            {showNewUnit ? t('common.cancel') : `+ ${t('communities.addUnit')}`}
          </button>
        </div>

        {showNewUnit && (
          <form onSubmit={handleAddUnit} className="card mt-4">
            <div className="grid gap-3 sm:grid-cols-6">
              <select
                className="input"
                value={newUnit.type}
                onChange={(e): void => setNewUnit({ ...newUnit, type: e.target.value as UnitType })}
              >
                <option value="VIVIENDA">{t('communities.typeVivienda')}</option>
                <option value="LOCAL">{t('communities.typeLocal')}</option>
                <option value="GARAJE">{t('communities.typeGaraje')}</option>
                <option value="TRASTERO">{t('communities.typeTrastero')}</option>
              </select>
              <input
                className="input sm:col-span-2"
                placeholder={t('communities.unitLabel')}
                value={newUnit.label}
                onChange={(e): void => setNewUnit({ ...newUnit, label: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder={t('communities.unitFloor')}
                value={newUnit.floor}
                onChange={(e): void => setNewUnit({ ...newUnit, floor: e.target.value })}
              />
              <input
                className="input"
                placeholder={t('communities.unitDoor')}
                value={newUnit.door}
                onChange={(e): void => setNewUnit({ ...newUnit, door: e.target.value })}
              />
              <input
                className="input font-mono"
                type="number"
                step="0.01"
                placeholder="%"
                value={newUnit.coefficient}
                onChange={(e): void => setNewUnit({ ...newUnit, coefficient: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary mt-4" disabled={createUnit.isPending}>
              {createUnit.isPending ? t('common.loading') : t('communities.addUnit')}
            </button>
          </form>
        )}

        {actionError && (
          <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
            {actionError}
          </div>
        )}

        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                <th className="px-4 py-3">{t('communities.unitType')}</th>
                <th className="px-4 py-3">{t('communities.unitLabel')}</th>
                <th className="px-4 py-3 text-right">{t('communities.unitCoef')}</th>
                <th className="px-4 py-3">{t('communities.unitOwner')}</th>
                <th className="px-4 py-3">{t('communities.unitOccupant')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {community.units.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-olive-500">
                    {t('communities.noUnits')}
                  </td>
                </tr>
              )}
              {community.units.map((u) => {
                const owner = u.ownerships?.[0]?.owner;
                const occupant = u.occupancies?.[0]?.occupant;
                return (
                  <tr key={u.id} className="border-b border-olive-50 last:border-0">
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-olive-600">
                      {u.type}
                    </td>
                    <td className="px-4 py-3 font-medium text-olive-900">{u.label}</td>
                    <td className="px-4 py-3 text-right font-mono text-olive-700">
                      {parseFloat(u.coefficient).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-olive-700">
                      {owner ? `${owner.firstName} ${owner.lastName}` : <span className="text-olive-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-olive-700">
                      {occupant ? `${occupant.firstName} ${occupant.lastName}` : <span className="text-olive-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(): Promise<void> => handleDeleteUnit(u.id)}
                        className="text-xs text-olive-500 hover:text-clay-600"
                        aria-label={t('common.remove')}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-olive-500">{label}</p>
      <p className="mt-1 font-display text-3xl text-olive-950">{value}</p>
    </div>
  );
}

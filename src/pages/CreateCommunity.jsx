import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCreateCommunity } from '@/hooks/useCommunities';

function emptyUnit() {
  return {
    _key: crypto.randomUUID(),
    type: 'VIVIENDA',
    label: '',
    floor: '',
    door: '',
    coefficient: '',
    surfaceM2: '',
  };
}

export function CreateCommunityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateCommunity();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cif, setCif] = useState('');
  const [units, setUnits] = useState([emptyUnit()]);
  const [error, setError] = useState(null);

  const coefficientSum = units.reduce((acc, u) => acc + (parseFloat(u.coefficient) || 0), 0);

  const addUnit = () => setUnits((prev) => [...prev, emptyUnit()]);
  const removeUnit = (key) => setUnits((prev) => prev.filter((u) => u._key !== key));
  const updateUnit = (key, patch) => {
    setUnits((prev) => prev.map((u) => (u._key === key ? { ...u, ...patch } : u)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validUnits = units
      .filter((u) => u.label.trim().length > 0)
      .map((u) => ({
        type: u.type,
        label: u.label.trim(),
        floor: u.floor.trim() || null,
        door: u.door.trim() || null,
        coefficient: parseFloat(u.coefficient) || 0,
        surfaceM2: u.surfaceM2 ? parseFloat(u.surfaceM2) : null,
      }));

    try {
      const community = await createMutation.mutateAsync({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: 'ES',
        cif: cif.trim() || null,
        units: validUnits,
      });
      navigate(`/communities/${community.id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('communities.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">
        {t('communities.newTitle')}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-olive-600">{t('communities.newSubtitle')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <section className="card space-y-5">
          <h2 className="font-display text-xl text-olive-900">{t('communities.basicData')}</h2>

          <div>
            <label className="label" htmlFor="name">{t('communities.name')}</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="label" htmlFor="address">{t('communities.address')}</label>
            <input id="address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="label" htmlFor="postalCode">{t('communities.postalCode')}</label>
              <input id="postalCode" className="input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="city">{t('communities.city')}</label>
              <input id="city" className="input" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="cif">{t('communities.cif')}</label>
            <input id="cif" className="input" value={cif} onChange={(e) => setCif(e.target.value)} />
          </div>
        </section>

        <section className="card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl text-olive-900">{t('communities.unitsTitle')}</h2>
              <p className="mt-1 text-sm text-olive-600">{t('communities.unitsHelp')}</p>
            </div>
            <div className="text-right text-xs">
              <p className="uppercase tracking-wider text-olive-500">{t('communities.coefSum')}</p>
              <p className={`font-mono text-lg ${coefficientSum > 100.01 ? 'text-clay-600' : 'text-olive-800'}`}>
                {coefficientSum.toFixed(2)} / 100
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-100 text-left text-xs uppercase tracking-wider text-olive-500">
                  <th className="py-2 pr-3 font-medium">{t('communities.unitType')}</th>
                  <th className="py-2 pr-3 font-medium">{t('communities.unitLabel')}</th>
                  <th className="py-2 pr-3 font-medium">{t('communities.unitFloor')}</th>
                  <th className="py-2 pr-3 font-medium">{t('communities.unitDoor')}</th>
                  <th className="py-2 pr-3 font-medium">{t('communities.unitCoef')}</th>
                  <th className="py-2 pr-3 font-medium">m²</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u._key} className="border-b border-olive-50">
                    <td className="py-2 pr-3">
                      <select className="input py-1.5" value={u.type} onChange={(e) => updateUnit(u._key, { type: e.target.value })}>
                        <option value="VIVIENDA">{t('communities.typeVivienda')}</option>
                        <option value="LOCAL">{t('communities.typeLocal')}</option>
                        <option value="GARAJE">{t('communities.typeGaraje')}</option>
                        <option value="TRASTERO">{t('communities.typeTrastero')}</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input className="input py-1.5" placeholder="3ºB" value={u.label} onChange={(e) => updateUnit(u._key, { label: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="input py-1.5 w-20" value={u.floor} onChange={(e) => updateUnit(u._key, { floor: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="input py-1.5 w-20" value={u.door} onChange={(e) => updateUnit(u._key, { door: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="input py-1.5 w-24 text-right font-mono" type="number" step="0.01" min="0" max="100" value={u.coefficient} onChange={(e) => updateUnit(u._key, { coefficient: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="input py-1.5 w-24 text-right font-mono" type="number" step="0.01" min="0" value={u.surfaceM2} onChange={(e) => updateUnit(u._key, { surfaceM2: e.target.value })} />
                    </td>
                    <td className="py-2 text-right">
                      <button type="button" onClick={() => removeUnit(u._key)} className="text-xs text-olive-500 hover:text-clay-600" disabled={units.length === 1} aria-label={t('common.remove')}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={addUnit} className="btn-ghost mt-4">
            + {t('communities.addUnit')}
          </button>
        </section>

        {error && (
          <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('common.loading') : t('communities.create')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </Layout>
  );
}

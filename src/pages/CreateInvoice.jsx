import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatMoney } from '@/components/StatusBadge';
import { useCommunity, useUnits } from '@/hooks/useCommunities';
import { useCreateInvoice } from '@/hooks/useInvoices';

const MODES = ['DERRAMA', 'INDIVIDUAL'];

export function CreateInvoicePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: community } = useCommunity(id);
  const { data: units } = useUnits(id);
  const createInvoice = useCreateInvoice(id ?? '');

  const [mode, setMode] = useState('DERRAMA');
  const [concept, setConcept] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [error, setError] = useState(null);

  const [totalAmount, setTotalAmount] = useState('');

  const [itemAmounts, setItemAmounts] = useState({});
  const [itemConsumption, setItemConsumption] = useState({});

  const derramaPreview = useMemo(() => {
    if (mode !== 'DERRAMA' || !units || !totalAmount) return [];
    const total = parseFloat(totalAmount) || 0;
    const sumCoef = units.reduce((acc, u) => acc + parseFloat(u.coefficient), 0);
    if (sumCoef <= 0) return [];
    return units.map((u) => ({
      unit: u,
      amount: (total * parseFloat(u.coefficient)) / sumCoef,
    }));
  }, [mode, units, totalAmount]);

  const individualTotal = useMemo(() => {
    return Object.values(itemAmounts).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  }, [itemAmounts]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let payload;
      if (mode === 'DERRAMA') {
        payload = {
          type: 'DERRAMA',
          concept: concept.trim(),
          description: description.trim() || null,
          totalAmount: parseFloat(totalAmount) || 0,
          dueDate: new Date(dueDate).toISOString(),
          attachmentUrl: attachmentUrl.trim() || null,
        };
      } else {
        const items = (units ?? [])
          .map((u) => ({
            unitId: u.id,
            amount: parseFloat(itemAmounts[u.id] ?? '') || 0,
            consumptionValue: itemConsumption[u.id] ? parseFloat(itemConsumption[u.id]) : null,
            consumptionUnit: itemConsumption[u.id] ? 'm3' : null,
          }))
          .filter((i) => i.amount > 0);
        if (items.length === 0) {
          setError(t('invoices.errorNoItems'));
          return;
        }
        payload = {
          type: 'INDIVIDUAL',
          concept: concept.trim(),
          description: description.trim() || null,
          dueDate: new Date(dueDate).toISOString(),
          attachmentUrl: attachmentUrl.trim() || null,
          items,
        };
      }

      const invoice = await createInvoice.mutateAsync(payload);
      navigate(`/invoices/${invoice.id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${id}/invoices`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('invoices.backToList')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium text-olive-950">{t('invoices.newTitle')}</h1>
      <p className="mt-2 text-sm text-olive-600">{community?.name}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <section className="card">
          <h2 className="font-display text-xl text-olive-900">{t('invoices.typeLabel')}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  mode === m ? 'border-olive-700 bg-olive-50 shadow-soft' : 'border-olive-200 bg-white hover:border-olive-300'
                }`}
              >
                <div className="font-medium text-olive-900">{t(`invoices.type${m}`)}</div>
                <div className="mt-1 text-xs text-olive-600">{t(`invoices.type${m}Desc`)}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="card space-y-5">
          <div>
            <label className="label" htmlFor="concept">{t('invoices.concept')}</label>
            <input id="concept" className="input" value={concept} onChange={(e) => setConcept(e.target.value)} required placeholder={t('invoices.conceptPlaceholder')} />
          </div>
          <div>
            <label className="label" htmlFor="description">{t('invoices.description')}</label>
            <textarea id="description" className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="dueDate">{t('invoices.dueDate')}</label>
              <input id="dueDate" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="attachmentUrl">{t('invoices.attachmentUrl')}</label>
              <input id="attachmentUrl" type="url" className="input" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="https://…" />
            </div>
          </div>
        </section>

        {mode === 'DERRAMA' && (
          <section className="card">
            <h2 className="font-display text-xl text-olive-900">{t('invoices.derramaTotal')}</h2>
            <div className="mt-4 max-w-xs">
              <label className="label" htmlFor="totalAmount">{t('invoices.totalAmount')}</label>
              <input id="totalAmount" type="number" step="0.01" min="0" className="input font-mono" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
            </div>

            {derramaPreview.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs uppercase tracking-wider text-olive-500">{t('invoices.distributionPreview')}</p>
                <div className="overflow-x-auto rounded-md border border-olive-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                        <th className="px-3 py-2">{t('communities.unitLabel')}</th>
                        <th className="px-3 py-2 text-right">{t('communities.unitCoef')}</th>
                        <th className="px-3 py-2 text-right">{t('invoices.amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {derramaPreview.map(({ unit, amount }) => (
                        <tr key={unit.id} className="border-b border-olive-50 last:border-0">
                          <td className="px-3 py-2 text-olive-800">{unit.label}</td>
                          <td className="px-3 py-2 text-right font-mono text-olive-600">{parseFloat(unit.coefficient).toFixed(2)}%</td>
                          <td className="px-3 py-2 text-right font-mono text-olive-900">{formatMoney(amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-olive-500">{t('invoices.distributionNote')}</p>
              </div>
            )}
          </section>
        )}

        {mode === 'INDIVIDUAL' && units && (
          <section className="card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-olive-900">{t('invoices.perUnitAmounts')}</h2>
              <div className="text-right text-xs">
                <p className="uppercase tracking-wider text-olive-500">{t('invoices.total')}</p>
                <p className="font-mono text-lg text-olive-800">{formatMoney(individualTotal)}</p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive-100 text-left text-xs uppercase tracking-wider text-olive-500">
                    <th className="py-2 pr-3">{t('communities.unitLabel')}</th>
                    <th className="py-2 pr-3 text-right">{t('invoices.amount')}</th>
                    <th className="py-2 text-right">{t('invoices.consumption')} (m³)</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id} className="border-b border-olive-50">
                      <td className="py-2 pr-3 text-olive-800">
                        {u.label} <span className="text-xs text-olive-400">{u.type.toLowerCase()}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input w-32 py-1.5 text-right font-mono"
                          value={itemAmounts[u.id] ?? ''}
                          onChange={(e) => setItemAmounts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="input w-28 py-1.5 text-right font-mono"
                          value={itemConsumption[u.id] ?? ''}
                          onChange={(e) => setItemConsumption((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-olive-500">{t('invoices.perUnitNote')}</p>
          </section>
        )}

        {error && (
          <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? t('common.loading') : t('invoices.issue')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </Layout>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatMoney, formatDate } from '@/components/StatusBadge';
import { useCommunity } from '@/hooks/useCommunities';
import { useAuth } from '@/contexts/AuthContext';
import {
  useRecurring,
  useCreateRecurring,
  useUpdateRecurring,
  useTriggerRecurring,
} from '@/hooks/useRecurring';

const FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'YEARLY'];

export function CommunityRecurringPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';

  const { data: community } = useCommunity(id);
  const { data, isLoading } = useRecurring(id);
  const createRecurring = useCreateRecurring(id ?? '');
  const updateRecurring = useUpdateRecurring(id ?? '');
  const triggerRecurring = useTriggerRecurring(id ?? '');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    concept: '',
    description: '',
    frequency: 'MONTHLY',
    amount: '',
    dayOfMonth: '',
    startAt: '',
  });
  const [formError, setFormError] = useState(null);

  const [triggerSuccess, setTriggerSuccess] = useState(null);
  const [triggerError, setTriggerError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createRecurring.mutateAsync({
        concept: form.concept.trim(),
        description: form.description.trim() || undefined,
        frequency: form.frequency,
        amount: parseFloat(form.amount) || 0,
        dayOfMonth: form.dayOfMonth ? parseInt(form.dayOfMonth, 10) : undefined,
        startAt: form.startAt || undefined,
      });
      setForm({ concept: '', description: '', frequency: 'MONTHLY', amount: '', dayOfMonth: '', startAt: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateRecurring.mutateAsync({ id: item.id, input: { active: !item.active } });
    } catch {
      // silently ignore — optimistic failure
    }
  };

  const handleTrigger = async (itemId) => {
    setTriggerSuccess(null);
    setTriggerError(null);
    try {
      await triggerRecurring.mutateAsync(itemId);
      setTriggerSuccess(itemId);
      setTimeout(() => setTriggerSuccess(null), 3000);
    } catch (err) {
      setTriggerError(err?.response?.data?.error?.message ?? t('errors.generic'));
      setTimeout(() => setTriggerError(null), 4000);
    }
  };

  const recurring = data?.recurring ?? [];

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('recurring.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('recurring.title')}</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
            {showForm ? t('common.cancel') : `+ ${t('recurring.newRecurring')}`}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={onSubmit} className="card mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="concept">{t('recurring.concept')}</label>
              <input
                id="concept"
                className="input"
                value={form.concept}
                onChange={(e) => setForm({ ...form, concept: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="frequency">{t('recurring.frequency')}</label>
              <select
                id="frequency"
                className="input"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{t(`recurring.${f}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="description">{t('recurring.description')}</label>
            <input
              id="description"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="amount">{t('recurring.amount')}</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="input font-mono"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="dayOfMonth">{t('recurring.dayOfMonth')}</label>
              <input
                id="dayOfMonth"
                type="number"
                min="1"
                max="28"
                className="input"
                value={form.dayOfMonth}
                onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="startAt">{t('recurring.startAt')}</label>
              <input
                id="startAt"
                type="date"
                className="input"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              />
            </div>
          </div>

          {formError && (
            <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
              {formError}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={createRecurring.isPending}>
            {createRecurring.isPending ? t('common.loading') : t('recurring.create')}
          </button>
        </form>
      )}

      {triggerSuccess && (
        <div role="status" className="mt-4 rounded-md border border-olive-300/40 bg-olive-100/60 px-3 py-2 text-sm text-olive-800">
          {t('recurring.triggered')}
        </div>
      )}

      {triggerError && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {triggerError}
        </div>
      )}

      <div className="mt-8">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}

        {!isLoading && recurring.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('recurring.empty')}</p>
          </div>
        )}

        {recurring.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recurring.map((item) => (
              <div key={item.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-olive-900">{item.concept}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-olive-500">{item.description}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.active
                        ? 'bg-olive-100 text-olive-700'
                        : 'bg-cream-200 text-olive-400'
                    }`}
                  >
                    {item.active ? t('recurring.active') : t('recurring.inactive')}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs uppercase tracking-wider text-olive-600">
                    {t(`recurring.${item.frequency}`)}
                  </span>
                  <span className="font-mono text-olive-900 font-medium">{formatMoney(item.amount)}</span>
                </div>

                {item.nextBillingAt && (
                  <p className="text-xs text-olive-500">
                    {t('recurring.nextBillingAt')}: {formatDate(item.nextBillingAt)}
                  </p>
                )}

                {isAdmin && (
                  <div className="mt-auto flex gap-2 pt-2 border-t border-olive-50">
                    <button
                      onClick={() => handleTrigger(item.id)}
                      disabled={triggerRecurring.isPending}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      {t('recurring.triggerNow')}
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={updateRecurring.isPending}
                      className="btn-ghost text-xs py-1 px-3"
                    >
                      {item.active ? t('recurring.deactivate') : t('recurring.activate')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

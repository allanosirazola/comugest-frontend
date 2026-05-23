import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import * as reportsApi from '@/api/reports';

export function CommunityReportsPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const [loading, setLoading] = useState(null); // which report is loading
  const [error, setError] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const download = async (type, fn) => {
    setLoading(type);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToDetail')}
      </Link>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-olive-600">{t('reports.eyebrow')}</p>
        <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('reports.title')}</h1>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Morosos */}
        <div className="card flex flex-col gap-3">
          <div>
            <p className="font-display text-lg font-medium text-olive-900">{t('reports.morosos.title')}</p>
            <p className="mt-1 text-sm text-olive-600">{t('reports.morosos.desc')}</p>
          </div>
          <button
            onClick={() => download('morosos', () => reportsApi.downloadMorosos(communityId))}
            disabled={loading !== null}
            className="btn-primary mt-auto w-fit"
          >
            {loading === 'morosos' ? t('common.loading') : t('reports.download')}
          </button>
        </div>

        {/* Budget */}
        <div className="card flex flex-col gap-3">
          <div>
            <p className="font-display text-lg font-medium text-olive-900">{t('reports.budget.title')}</p>
            <p className="mt-1 text-sm text-olive-600">{t('reports.budget.desc')}</p>
          </div>
          <button
            onClick={() => download('budget', () => reportsApi.downloadBudget(communityId))}
            disabled={loading !== null}
            className="btn-primary mt-auto w-fit"
          >
            {loading === 'budget' ? t('common.loading') : t('reports.download')}
          </button>
        </div>

        {/* Payments */}
        <div className="card flex flex-col gap-3">
          <div>
            <p className="font-display text-lg font-medium text-olive-900">{t('reports.payments.title')}</p>
            <p className="mt-1 text-sm text-olive-600">{t('reports.payments.desc')}</p>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="input flex-1 text-sm"
              placeholder={t('reports.payments.from')}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              className="input flex-1 text-sm"
              placeholder={t('reports.payments.to')}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button
            onClick={() => download('payments', () => reportsApi.downloadPayments(communityId, from || undefined, to || undefined))}
            disabled={loading !== null}
            className="btn-primary mt-auto w-fit"
          >
            {loading === 'payments' ? t('common.loading') : t('reports.download')}
          </button>
        </div>
      </div>
    </Layout>
  );
}

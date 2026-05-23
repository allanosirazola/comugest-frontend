import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useBillingStatus, useCreateCheckout, useCreatePortal } from '@/hooks/useBilling';

const STATUS_CONFIG = {
  FREE: { color: 'bg-gray-100 text-gray-700', labelKey: 'billing.statusFree' },
  ACTIVE: { color: 'bg-green-100 text-green-800', labelKey: 'billing.statusActive' },
  PAST_DUE: { color: 'bg-amber-100 text-amber-800', labelKey: 'billing.statusPastDue' },
  CANCELLED: { color: 'bg-clay-100 text-clay-700', labelKey: 'billing.statusCancelled' },
};

export function BillingPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get('session_id');
  const { data: billing, isLoading } = useBillingStatus();
  const checkout = useCreateCheckout();
  const portal = useCreatePortal();

  const status = billing?.planStatus ?? 'FREE';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.FREE;
  const isActive = status === 'ACTIVE';

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('billing.eyebrow')}</p>
      <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('billing.title')}</h1>

      {successParam && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t('billing.successMessage')}
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-olive-600">{t('common.loading')}</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Current plan card */}
          <div className="card flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-olive-500">{t('billing.currentPlan')}</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="font-display text-3xl font-medium text-olive-950">
                  {isActive ? 'Comugest PRO' : t('billing.freePlan')}
                </p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                  {t(cfg.labelKey)}
                </span>
              </div>
            </div>

            {billing?.planCurrentPeriodEnd && isActive && (
              <p className="text-sm text-olive-600">
                {t('billing.renewsOn', { date: new Date(billing.planCurrentPeriodEnd).toLocaleDateString() })}
              </p>
            )}

            {status === 'PAST_DUE' && (
              <p className="text-sm text-amber-700">{t('billing.pastDueWarning')}</p>
            )}

            {!isActive ? (
              <button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
                className="btn-primary mt-auto"
              >
                {checkout.isPending ? t('common.loading') : t('billing.upgrade')}
              </button>
            ) : (
              <button
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
                className="btn-ghost mt-auto"
              >
                {portal.isPending ? t('common.loading') : t('billing.manageSubscription')}
              </button>
            )}
          </div>

          {/* PRO features card */}
          <div className="card flex flex-col gap-3">
            <p className="font-display text-lg font-medium text-olive-900">{t('billing.proFeaturesTitle')}</p>
            <ul className="space-y-2 text-sm text-olive-700">
              {[
                'billing.feature.communities',
                'billing.feature.documents',
                'billing.feature.reports',
                'billing.feature.meters',
                'billing.feature.polls',
                'billing.feature.calendar',
                'billing.feature.support',
              ].map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="text-olive-500">✓</span>
                  {t(key)}
                </li>
              ))}
            </ul>
            {!isActive && (
              <p className="mt-2 text-xs text-olive-500">{t('billing.acceptedMethods')}</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

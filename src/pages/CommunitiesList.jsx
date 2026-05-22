import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunities } from '@/hooks/useCommunities';

export function CommunitiesListPage() {
  const { t } = useTranslation();
  const { data: communities, isLoading, error } = useCommunities();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('communities.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">
            {t('communities.listTitle')}
          </h1>
        </div>
        <Link to="/communities/new" className="btn-primary">
          + {t('communities.create')}
        </Link>
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}

        {error && (
          <p className="rounded-md border border-clay-400/40 bg-clay-400/10 p-3 text-sm text-clay-700">
            {t('errors.generic')}
          </p>
        )}

        {communities && communities.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('communities.emptyTitle')}</p>
            <p className="mt-2 text-sm text-olive-600">{t('communities.emptySubtitle')}</p>
            <Link to="/communities/new" className="btn-primary mt-6 inline-flex">
              {t('communities.createFirst')}
            </Link>
          </div>
        )}

        {communities && communities.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <Link
                key={c.id}
                to={`/communities/${c.id}`}
                className="card group transition-shadow hover:shadow-md"
              >
                <h3 className="font-display text-xl font-medium text-olive-950 group-hover:text-olive-700">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-olive-600">{c.address}</p>
                <p className="text-sm text-olive-600">
                  {c.postalCode} {c.city}
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-olive-100 pt-3 text-xs text-olive-500">
                  <span>
                    <strong className="text-olive-800">{c._count.units}</strong>{' '}
                    {t('communities.unitsLabel')}
                  </span>
                  {c.cif && <span>CIF: {c.cif}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

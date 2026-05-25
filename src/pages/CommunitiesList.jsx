import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunities } from '@/hooks/useCommunities';

function ComparisonTable({ communities, t }) {
  if (!communities || communities.length < 2) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-olive-900">Comparativa de comunidades</h2>
      <p className="mt-1 text-sm text-olive-500">
        Resumen de las métricas disponibles en el listado. Los datos detallados (facturas, morosos, gastos) se cargan por comunidad.
      </p>
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
              <th className="px-4 py-3">Comunidad</th>
              <th className="px-4 py-3 text-right">Unidades</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">CIF</th>
              <th className="px-4 py-3 text-right">Facturas pendientes</th>
              <th className="px-4 py-3 text-right">Morosos</th>
              <th className="px-4 py-3 text-right">Gastos YTD</th>
            </tr>
          </thead>
          <tbody>
            {communities.map((c) => (
              <tr key={c.id} className="border-b border-olive-50 transition-colors hover:bg-olive-50/40 last:border-0">
                <td className="px-4 py-3">
                  <Link to={`/communities/${c.id}`} className="font-medium text-olive-900 hover:text-olive-600">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono text-olive-700">
                  {c._count?.units ?? '—'}
                </td>
                <td className="px-4 py-3 text-olive-600">{c.city}</td>
                <td className="px-4 py-3 font-mono text-xs text-olive-500">{c.cif ?? '—'}</td>
                <td className="px-4 py-3 text-right text-olive-400" title="No disponible en el listado">—</td>
                <td className="px-4 py-3 text-right text-olive-400" title="No disponible en el listado">—</td>
                <td className="px-4 py-3 text-right text-olive-400" title="No disponible en el listado">—</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-olive-100 bg-cream-50/50">
              <td className="px-4 py-2 text-xs font-medium text-olive-600">Total</td>
              <td className="px-4 py-2 text-right font-mono text-xs font-semibold text-olive-800">
                {communities.reduce((sum, c) => sum + (c._count?.units ?? 0), 0)}
              </td>
              <td colSpan={5} className="px-4 py-2 text-xs text-olive-400">
                Los datos de facturas, morosos y gastos se consultan en cada comunidad individual.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

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

      <ComparisonTable communities={communities} t={t} />
    </Layout>
  );
}

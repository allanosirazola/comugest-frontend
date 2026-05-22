import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { formatDate } from '@/components/StatusBadge';
import { ProcedureStatusBadge } from '@/components/ProcedureStatusBadge';
import { useMyProcedures } from '@/hooks/useProcedures';

export function MyProceduresPage() {
  const { t } = useTranslation();
  const { data: procedures, isLoading } = useMyProcedures();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('procedures.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('procedures.mine')}</h1>
        </div>
        <Link to="/procedures/new" className="btn-primary">+ {t('procedures.new')}</Link>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-olive-600">{t('common.loading')}</p>}
        {procedures && procedures.length === 0 && (
          <div className="card text-center">
            <p className="font-display text-xl text-olive-950">{t('procedures.emptyMine')}</p>
            <Link to="/procedures/new" className="btn-primary mt-6 inline-flex">{t('procedures.new')}</Link>
          </div>
        )}
        {procedures?.map((p) => (
          <Link key={p.id} to={`/procedures/${p.id}`} className="card flex items-start justify-between gap-4 transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-olive-900">{p.subject}</h3>
                <ProcedureStatusBadge status={p.status} />
              </div>
              <p className="mt-1 text-xs text-olive-500">
                {t(`procedures.ty.${p.type}`)} · {p.community?.name} · {formatDate(p.createdAt)}
                {p._count ? ` · ${p._count.updates} ${t('procedures.messages')}` : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

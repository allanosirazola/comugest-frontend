import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminKpis } from '@/hooks/useAdmin';
import { formatMoney } from '@/components/StatusBadge';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';
  const isAdminFincas = user?.role === 'ADMIN_FINCAS';

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('dashboard.eyebrow')}</p>
      <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-olive-950">
        {t('dashboard.welcome', { name: user?.firstName })}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-olive-600">{t('dashboard.placeholder')}</p>

      {isAdminFincas && <AdminKpiStrip />}

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin ? <AdminCards /> : <VecinoCards />}
      </section>
    </Layout>
  );
}

function AdminKpiStrip() {
  const { t } = useTranslation();
  const { data } = useAdminKpis();
  if (!data) return null;

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiTile
        label={t('dashboard.kpi.pendingInvoices')}
        value={formatMoney(data.invoices.totalPending)}
        accent={data.invoices.totalPending > 0}
      />
      <KpiTile
        label={t('dashboard.kpi.overdueCount')}
        value={String(data.invoices.overdueCount)}
        accent={data.invoices.overdueCount > 0}
      />
      <KpiTile
        label={t('dashboard.kpi.openProcedures')}
        value={String(data.procedures.open)}
      />
      <KpiTile
        label={t('dashboard.kpi.openTickets')}
        value={String(data.tickets.open)}
      />
    </div>
  );
}

function KpiTile({ label, value, accent }) {
  return (
    <div className={`card flex flex-col gap-1 ${accent ? 'border-clay-400/40 bg-clay-400/5' : ''}`}>
      <p className="text-xs uppercase tracking-wider text-olive-500">{label}</p>
      <p className={`font-display text-2xl font-medium ${accent ? 'text-clay-700' : 'text-olive-950'}`}>{value}</p>
    </div>
  );
}

function Card({ titleKey, descKey, to, soon }) {
  const { t } = useTranslation();
  const content = (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium text-olive-900">{t(titleKey)}</h3>
        {soon && (
          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-olive-700">
            {t('common.soon')}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-olive-600">{t(descKey)}</p>
    </>
  );
  return to ? (
    <Link to={to} className="card transition-shadow hover:shadow-md">{content}</Link>
  ) : (
    <div className="card opacity-75">{content}</div>
  );
}

function AdminCards() {
  return (
    <>
      <Card titleKey="dashboard.admin.communities.title" descKey="dashboard.admin.communities.desc" to="/communities" />
      <Card titleKey="dashboard.admin.invite.title" descKey="dashboard.admin.invite.desc" to="/admin/invite" />
      <Card titleKey="dashboard.admin.invoices.title" descKey="dashboard.admin.invoices.desc" to="/communities" />
      <Card titleKey="dashboard.admin.messages.title" descKey="dashboard.admin.messages.desc" to="/messages" />
      <Card titleKey="dashboard.admin.announcements.title" descKey="dashboard.admin.announcements.desc" to="/communities" />
      <Card titleKey="dashboard.admin.expenses.title" descKey="dashboard.admin.expenses.desc" to="/communities" />
      <Card titleKey="dashboard.admin.tickets.title" descKey="dashboard.admin.tickets.desc" to="/my-tickets" />
      <Card titleKey="dashboard.admin.audit.title" descKey="dashboard.admin.audit.desc" to="/admin/audit" />
    </>
  );
}

function VecinoCards() {
  return (
    <>
      <Card titleKey="dashboard.vecino.myInvoices.title" descKey="dashboard.vecino.myInvoices.desc" to="/my-invoices" />
      <Card titleKey="dashboard.vecino.messages.title" descKey="dashboard.vecino.messages.desc" to="/messages" />
      <Card titleKey="dashboard.vecino.announcements.title" descKey="dashboard.vecino.announcements.desc" to="/announcements" />
      <Card titleKey="dashboard.vecino.expenses.title" descKey="dashboard.vecino.expenses.desc" to="/expenses" />
      <Card titleKey="dashboard.vecino.procedures.title" descKey="dashboard.vecino.procedures.desc" to="/procedures" />
      <Card titleKey="dashboard.vecino.reservations.title" descKey="dashboard.vecino.reservations.desc" to="/my-reservations" />
      <Card titleKey="dashboard.vecino.meetings.title" descKey="dashboard.vecino.meetings.desc" to="/my-meetings" />
      <Card titleKey="dashboard.vecino.documents.title" descKey="dashboard.vecino.documents.desc" to="/documents" />
      <Card titleKey="dashboard.vecino.calendar.title" descKey="dashboard.vecino.calendar.desc" to="/calendar" />
    </>
  );
}

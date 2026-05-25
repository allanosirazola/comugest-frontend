import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminKpis } from '@/hooks/useAdmin';
import { formatMoney } from '@/components/StatusBadge';
import { useCommunities } from '@/hooks/useCommunities';
import { useCommunityInvoices } from '@/hooks/useInvoices';
import { useCommunityExpenses } from '@/hooks/useExpenses';
import { OnboardingWizard } from '@/components/OnboardingWizard';

const PIE_COLORS = ['#4a5329', '#6b7a3a', '#a3b373', '#d4b566', '#c17d4d', '#8b9e5a', '#5c6b30'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';
  const isAdminFincas = user?.role === 'ADMIN_FINCAS';

  const { data: communities } = useCommunities();
  const firstCommunityId = communities?.[0]?.id ?? null;

  const [showWizard, setShowWizard] = useState(
    isAdminFincas && !localStorage.getItem('onboarding_dismissed')
  );

  return (
    <Layout>
      {showWizard && communities?.length === 0 && (
        <OnboardingWizard
          onDismiss={() => {
            localStorage.setItem('onboarding_dismissed', '1');
            setShowWizard(false);
          }}
        />
      )}

      <p className="text-xs uppercase tracking-wider text-olive-600">{t('dashboard.eyebrow')}</p>
      <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-olive-950">
        {t('dashboard.welcome', { name: user?.firstName })}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-olive-600">{t('dashboard.placeholder')}</p>

      {isAdminFincas && <AdminKpiStrip />}

      {isAdminFincas && <ActivationChecklist communities={communities} />}

      {isAdminFincas && firstCommunityId && <AdminCharts communityId={firstCommunityId} />}

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
      <Card titleKey="dashboard.admin.billing.title" descKey="dashboard.admin.billing.desc" to="/billing" />
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

// ─── Activation Checklist ─────────────────────────────────────

function ActivationChecklist({ communities }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('checklist_dismissed'));

  const hasCommunity = (communities?.length ?? 0) > 0;
  const allDone = hasCommunity; // expand as more checks are added

  if (dismissed || allDone) return null;

  const steps = [
    { label: 'Cuenta creada', done: true },
    { label: 'Crear tu primera comunidad', done: hasCommunity, action: () => navigate('/communities/new') },
    { label: 'Invitar tu primer vecino', done: false, action: () => navigate('/admin/invite') },
    { label: 'Emitir tu primera factura', done: false, action: () => navigate('/communities') },
  ];

  const completedCount = steps.filter(s => s.done).length;

  return (
    <div className="mt-6 card border-olive-200 bg-olive-50/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-medium text-olive-900">
            Primeros pasos ({completedCount}/{steps.length})
          </p>
          <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-olive-500 transition-all"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => { localStorage.setItem('checklist_dismissed', '1'); setDismissed(true); }}
          className="text-xs text-olive-400 hover:text-olive-600"
        >
          Ocultar
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${
              step.done ? 'bg-olive-500 text-white' : 'border-2 border-cream-300 text-transparent'
            }`}>
              ✓
            </span>
            {step.done ? (
              <span className="text-sm text-olive-500 line-through">{step.label}</span>
            ) : (
              <button onClick={step.action} className="text-sm text-olive-800 underline-offset-2 hover:underline">
                {step.label} →
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Admin Charts ────────────────────────────────────────────

function computeMonthlyBarData(invoices) {
  if (!invoices || invoices.length === 0) return [];
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      invoiced: 0,
      collected: 0,
    });
  }
  for (const inv of invoices) {
    const issueKey = inv.issueDate?.slice(0, 7);
    const bucket = months.find((m) => m.key === issueKey);
    if (!bucket) continue;
    for (const item of inv.items ?? []) {
      bucket.invoiced += parseFloat(item.amount ?? 0);
      for (const p of item.payments ?? []) {
        bucket.collected += parseFloat(p.amount ?? 0);
      }
    }
  }
  return months;
}

function computeExpensePieData(expenses) {
  if (!expenses || expenses.length === 0) return [];
  const byCategory = {};
  for (const exp of expenses) {
    const cat = exp.category ?? 'OTHER';
    byCategory[cat] = (byCategory[cat] ?? 0) + parseFloat(exp.amount ?? 0);
  }
  return Object.entries(byCategory).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
}

function AdminCharts({ communityId }) {
  const { data: invoices, isLoading: invLoading } = useCommunityInvoices(communityId);
  const { data: expenses, isLoading: expLoading } = useCommunityExpenses(communityId);

  if (invLoading || expLoading) return null;

  const barData = computeMonthlyBarData(invoices);
  const pieData = computeExpensePieData(expenses);

  if (barData.length === 0 && pieData.length === 0) return null;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {barData.length > 0 && (
        <div className="card">
          <p className="mb-4 text-sm font-semibold text-olive-800">Facturado vs cobrado (6 meses)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7a3a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7a3a' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
              <Tooltip formatter={(v) => `${v.toFixed(2)} €`} contentStyle={{ borderRadius: 8, border: '1px solid #d4d4a8', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="invoiced" name="Facturado" fill="#4a5329" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Cobrado" fill="#a3b373" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="card">
          <p className="mb-4 text-sm font-semibold text-olive-800">Gastos por categoría</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toFixed(2)} €`} contentStyle={{ borderRadius: 8, border: '1px solid #d4d4a8', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

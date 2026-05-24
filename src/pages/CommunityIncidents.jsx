import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunity } from '@/hooks/useCommunities';
import {
  useIncidents,
  useCreateIncident,
  useUpdateIncidentStatus,
} from '@/hooks/useIncidents';

const STATUS_META = {
  OPEN:        { label: 'statusOpen',       cls: 'bg-red-100 text-red-700 border-red-200' },
  IN_PROGRESS: { label: 'statusInProgress', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  RESOLVED:    { label: 'statusResolved',   cls: 'bg-green-100 text-green-700 border-green-200' },
  CLOSED:      { label: 'statusClosed',     cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const CATEGORY_META = {
  STRUCTURAL: 'bg-stone-100 text-stone-700 border-stone-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PLUMBING:   'bg-blue-100 text-blue-700 border-blue-200',
  LIFT:       'bg-violet-100 text-violet-700 border-violet-200',
  FIRE:       'bg-orange-100 text-orange-700 border-orange-200',
  GENERAL:    'bg-olive-100 text-olive-700 border-olive-200',
  OTHER:      'bg-gray-100 text-gray-600 border-gray-200',
};

const CATEGORIES = ['GENERAL', 'STRUCTURAL', 'ELECTRICAL', 'PLUMBING', 'LIFT', 'FIRE', 'OTHER'];
const STATUSES   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function StatusBadge({ status, t }) {
  const meta = STATUS_META[status] ?? STATUS_META.OPEN;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
      {t(`incidents.${meta.label}`)}
    </span>
  );
}

function CategoryBadge({ category, t }) {
  const cls = CATEGORY_META[category] ?? CATEGORY_META.OTHER;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {t(`incidents.categories.${category}`)}
    </span>
  );
}

function NewIncidentModal({ onClose, onSubmit, isPending, t }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'GENERAL' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-olive-950">{t('incidents.new')}</h2>
          <button onClick={onClose} className="text-olive-400 hover:text-olive-700" aria-label={t('common.cancel')}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="inc-title">Título</label>
            <input
              id="inc-title"
              className="input"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Descripción breve de la incidencia"
            />
          </div>
          <div>
            <label className="label" htmlFor="inc-category">Categoría</label>
            <select
              id="inc-category"
              className="input"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`incidents.categories.${c}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="inc-desc">Descripción</label>
            <textarea
              id="inc-desc"
              className="input h-28 resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detalla la incidencia: qué ocurrió, dónde, cuándo…"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={isPending}>
              {isPending ? t('common.loading') : t('incidents.new')}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IncidentRow({ incident, index, communityId, t }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus]     = useState(incident.status);
  const [resolution, setResolution] = useState(incident.resolution ?? '');
  const [saving, setSaving]     = useState(false);
  const updateStatus = useUpdateIncidentStatus(communityId);

  const num = String(index + 1).padStart(3, '0');
  const date = new Date(incident.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStatus.mutateAsync({ incidentId: incident.id, status, resolution: resolution || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr
        className="cursor-pointer border-b border-olive-50 transition-colors hover:bg-olive-50/50 last:border-0"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 font-mono text-xs text-olive-500">#{num}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-olive-900">{incident.title}</p>
        </td>
        <td className="hidden px-4 py-3 sm:table-cell">
          <CategoryBadge category={incident.category} t={t} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={incident.status} t={t} />
        </td>
        <td className="hidden px-4 py-3 text-sm text-olive-500 md:table-cell">{date}</td>
        <td className="px-4 py-3 text-right text-xs text-olive-400">
          {expanded ? '▲' : '▼'}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-olive-100 bg-cream-50/60">
          <td colSpan={6} className="px-6 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-olive-500">Descripción</p>
                <p className="whitespace-pre-wrap text-sm text-olive-800">
                  {incident.description || <span className="italic text-olive-400">Sin descripción</span>}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CategoryBadge category={incident.category} t={t} />
                  <span className="text-xs text-olive-400">{date}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor={`status-${incident.id}`}>Estado</label>
                  <select
                    id={`status-${incident.id}`}
                    className="input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{t(`incidents.${STATUS_META[s].label}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor={`res-${incident.id}`}>Resolución</label>
                  <textarea
                    id={`res-${incident.id}`}
                    className="input h-20 resize-none"
                    placeholder="Anota la resolución o las acciones tomadas…"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CommunityIncidentsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: community } = useCommunity(id);
  const { data: incidents = [], isLoading } = useIncidents(id);
  const createIncident = useCreateIncident(id);

  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [createError, setCreateError] = useState(null);

  const filtered = incidents.filter((inc) => {
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesSearch =
      !search ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      (inc.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreate = async (input) => {
    setCreateError(null);
    try {
      await createIncident.mutateAsync(input);
      setShowModal(false);
    } catch (err) {
      setCreateError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${id}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('incidents.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('incidents.title')}</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + {t('incidents.new')}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          className="input max-w-xs"
          placeholder="Buscar incidencia…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input w-44"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`incidents.${STATUS_META[s].label}`)}</option>
          ))}
        </select>
      </div>

      {createError && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {createError}
        </div>
      )}

      <div className="card mt-6 overflow-x-auto p-0">
        {isLoading ? (
          <p className="p-6 text-sm text-olive-500">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-olive-500">No hay incidencias que coincidan con el filtro.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-100 bg-cream-100/50 text-left text-xs uppercase tracking-wider text-olive-600">
                <th className="px-4 py-3">{t('incidents.number')}</th>
                <th className="px-4 py-3">Título</th>
                <th className="hidden px-4 py-3 sm:table-cell">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="hidden px-4 py-3 md:table-cell">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  index={incidents.indexOf(inc)}
                  communityId={id}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary stats */}
      {incidents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-olive-600">
          <span>
            <strong className="text-olive-900">{incidents.filter((i) => i.status === 'OPEN').length}</strong> abiertas
          </span>
          <span>
            <strong className="text-olive-900">{incidents.filter((i) => i.status === 'IN_PROGRESS').length}</strong> en curso
          </span>
          <span>
            <strong className="text-olive-900">{incidents.filter((i) => i.status === 'RESOLVED').length}</strong> resueltas
          </span>
          <span>
            <strong className="text-olive-900">{incidents.length}</strong> total
          </span>
        </div>
      )}

      {showModal && (
        <NewIncidentModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          isPending={createIncident.isPending}
          t={t}
        />
      )}
    </Layout>
  );
}

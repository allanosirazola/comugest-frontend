import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/hooks/useDocuments';

const CATEGORIES = ['ACTA', 'REGLAMENTO', 'PRESUPUESTO', 'CONTRATO', 'CERTIFICADO', 'OTRO'];

const CATEGORY_COLORS = {
  ACTA: 'bg-olive-100 text-olive-800',
  REGLAMENTO: 'bg-blue-100 text-blue-800',
  PRESUPUESTO: 'bg-amber-100 text-amber-800',
  CONTRATO: 'bg-purple-100 text-purple-800',
  CERTIFICADO: 'bg-green-100 text-green-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

export function CommunityDocumentsPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const { data: docs = [], isLoading } = useDocuments(communityId);
  const createDoc = useCreateDocument(communityId);
  const deleteDoc = useDeleteDocument(communityId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: 'OTRO', url: '', publicForResidents: true,
  });
  const [actionError, setActionError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createDoc.mutateAsync({ ...form, publicForResidents: Boolean(form.publicForResidents) });
      setShowForm(false);
      setForm({ name: '', description: '', category: 'OTRO', url: '', publicForResidents: true });
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm(t('documents.confirmDelete'))) return;
    try {
      await deleteDoc.mutateAsync(docId);
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  if (isLoading) {
    return <Layout><p className="text-olive-600">{t('common.loading')}</p></Layout>;
  }

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = docs.filter((d) => d.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToDetail')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('documents.eyebrow')}</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('documents.title')}</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? t('common.cancel') : `+ ${t('documents.addDocument')}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="input sm:col-span-2"
              placeholder={t('documents.fieldName')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="input sm:col-span-2"
              placeholder={t('documents.fieldUrl')}
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
            />
            <textarea
              className="input sm:col-span-2"
              placeholder={t('documents.fieldDescription')}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`documents.category.${c.toLowerCase()}`)}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-olive-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publicForResidents}
                onChange={(e) => setForm({ ...form, publicForResidents: e.target.checked })}
                className="rounded border-olive-300"
              />
              {t('documents.publicForResidents')}
            </label>
          </div>
          <button type="submit" className="btn-primary w-fit" disabled={createDoc.isPending}>
            {createDoc.isPending ? t('common.loading') : t('documents.addDocument')}
          </button>
        </form>
      )}

      {actionError && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {actionError}
        </div>
      )}

      {docs.length === 0 ? (
        <p className="mt-10 text-center text-olive-500">{t('documents.empty')}</p>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="mb-3 font-display text-xl text-olive-900">
                {t(`documents.category.${cat.toLowerCase()}`)}
              </h2>
              <div className="space-y-2">
                {items.map((doc) => (
                  <div key={doc.id} className="card flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CATEGORY_COLORS[doc.category]}`}>
                          {t(`documents.category.${doc.category.toLowerCase()}`)}
                        </span>
                        {!doc.publicForResidents && (
                          <span className="rounded-full bg-clay-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-clay-700">
                            {t('documents.adminOnly')}
                          </span>
                        )}
                        <span className="text-xs text-olive-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block font-medium text-olive-900 hover:text-olive-600 hover:underline"
                      >
                        {doc.name}
                      </a>
                      {doc.description && (
                        <p className="mt-0.5 text-sm text-olive-600">{doc.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="shrink-0 text-xs text-olive-500 hover:text-clay-600"
                      aria-label={t('common.remove')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Layout>
  );
}

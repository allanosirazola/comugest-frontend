import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useSuppliers';

const BLANK = { name: '', cif: '', email: '', phone: '', address: '', notes: '' };

export function CommunitySuppliersPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const { data: suppliers = [], isLoading } = useSuppliers(communityId);
  const createSupplier = useCreateSupplier(communityId);
  const updateSupplier = useUpdateSupplier(communityId);
  const deleteSupplier = useDeleteSupplier(communityId);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // supplier id being edited
  const [form, setForm] = useState(BLANK);
  const [actionError, setActionError] = useState(null);

  const openCreate = () => { setEditing(null); setForm(BLANK); setShowForm(true); };
  const openEdit = (s) => { setEditing(s.id); setForm({ name: s.name, cif: s.cif ?? '', email: s.email ?? '', phone: s.phone ?? '', address: s.address ?? '', notes: s.notes ?? '' }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(BLANK); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      if (editing) {
        await updateSupplier.mutateAsync({ id: editing, ...form });
      } else {
        await createSupplier.mutateAsync(form);
      }
      closeForm();
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('suppliers.confirmDelete'))) return;
    setActionError(null);
    try {
      await deleteSupplier.mutateAsync(id);
    } catch (err) {
      setActionError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  const isPending = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {t('communities.backToDetail')}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">{t('suppliers.eyebrow')}</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('suppliers.title')}</h1>
        </div>
        <button onClick={showForm ? closeForm : openCreate} className="btn-primary">
          {showForm ? t('common.cancel') : `+ ${t('suppliers.addSupplier')}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 grid gap-3 sm:grid-cols-2">
          <input className="input sm:col-span-2" placeholder={t('suppliers.fieldName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder={t('suppliers.fieldCif')} value={form.cif} onChange={(e) => setForm({ ...form, cif: e.target.value })} />
          <input className="input" type="email" placeholder={t('suppliers.fieldEmail')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder={t('suppliers.fieldPhone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder={t('suppliers.fieldAddress')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <textarea className="input sm:col-span-2" rows={2} placeholder={t('suppliers.fieldNotes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="btn-primary w-fit" disabled={isPending}>
            {isPending ? t('common.loading') : editing ? t('common.save') : t('suppliers.addSupplier')}
          </button>
        </form>
      )}

      {actionError && (
        <div role="alert" className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-olive-600">{t('common.loading')}</p>
      ) : suppliers.length === 0 ? (
        <p className="mt-10 text-center text-olive-500">{t('suppliers.empty')}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <div key={s.id} className="card flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-lg font-medium text-olive-900">{s.name}</p>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => openEdit(s)} className="text-xs text-olive-500 hover:text-olive-900">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs text-olive-500 hover:text-clay-600">✕</button>
                </div>
              </div>
              {s.cif && <p className="text-xs text-olive-500">CIF: {s.cif}</p>}
              {s.email && <a href={`mailto:${s.email}`} className="text-sm text-olive-700 hover:underline">{s.email}</a>}
              {s.phone && <p className="text-sm text-olive-700">{s.phone}</p>}
              {s.address && <p className="text-sm text-olive-600">{s.address}</p>}
              {s.notes && <p className="text-xs text-olive-500 italic">{s.notes}</p>}
              {s._count && (
                <p className="mt-1 text-xs text-olive-400">{t('suppliers.expenseCount', { count: s._count.expenses })}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

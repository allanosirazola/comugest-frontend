import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useMyCommunities } from '@/hooks/useCommunities';
import { useCreateProcedure } from '@/hooks/useProcedures';
import { PROCEDURE_TYPES } from '@/api/procedures';

export function CreateProcedurePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: communities } = useMyCommunities();
  const createProcedure = useCreateProcedure();

  const [communityId, setCommunityId] = useState('');
  const [type, setType] = useState('CERTIFICATE');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!communityId && communities && communities.length > 0) setCommunityId(communities[0].id);
  }, [communities, communityId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const procedure = await createProcedure.mutateAsync({
        communityId,
        type,
        subject: subject.trim(),
        description: description.trim(),
      });
      navigate(`/procedures/${procedure.id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  if (communities && communities.length === 0) {
    return (
      <Layout>
        <h1 className="font-display text-3xl font-medium text-olive-950">{t('procedures.newTitle')}</h1>
        <div className="card mt-8 text-center">
          <p className="text-olive-600">{t('procedures.notInCommunity')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('procedures.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('procedures.newTitle')}</h1>
      <p className="mt-3 max-w-xl text-sm text-olive-600">{t('procedures.newSubtitle')}</p>

      <form onSubmit={onSubmit} className="card mt-8 max-w-2xl space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="community">{t('procedures.community')}</label>
            <select id="community" className="input" value={communityId} onChange={(e) => setCommunityId(e.target.value)} required>
              {communities?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="type">{t('procedures.type')}</label>
            <select id="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {PROCEDURE_TYPES.map((ty) => <option key={ty} value={ty}>{t(`procedures.ty.${ty}`)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="subject">{t('procedures.subject')}</label>
          <input id="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={200} />
        </div>
        <div>
          <label className="label" htmlFor="description">{t('procedures.description')}</label>
          <textarea id="description" className="input min-h-32" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder={t('procedures.descriptionPlaceholder')} />
        </div>
        {error && <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">{error}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createProcedure.isPending}>
            {createProcedure.isPending ? t('common.loading') : t('procedures.submit')}
          </button>
          <Link to="/procedures" className="btn-ghost">{t('procedures.mine')}</Link>
        </div>
      </form>
    </Layout>
  );
}

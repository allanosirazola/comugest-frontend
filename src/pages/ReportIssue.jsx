import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCreateTicket } from '@/hooks/useTickets';
import { TICKET_CATEGORIES } from '@/api/tickets';

export function ReportIssuePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createTicket = useCreateTicket();

  const [category, setCategory] = useState('BUG');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createTicket.mutateAsync({ category, subject: subject.trim(), description: description.trim() });
      navigate('/my-tickets', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('tickets.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('tickets.reportTitle')}</h1>
      <p className="mt-3 max-w-xl text-sm text-olive-600">{t('tickets.reportSubtitle')}</p>

      <form onSubmit={onSubmit} className="card mt-8 max-w-2xl space-y-5">
        <div>
          <label className="label" htmlFor="category">{t('tickets.category')}</label>
          <select id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`tickets.cat.${c}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="subject">{t('tickets.subject')}</label>
          <input id="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={200} />
        </div>
        <div>
          <label className="label" htmlFor="description">{t('tickets.description')}</label>
          <textarea id="description" className="input min-h-32" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder={t('tickets.descriptionPlaceholder')} />
        </div>
        <p className="text-xs text-olive-500">{t('tickets.contextNote')}</p>
        {error && <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">{error}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createTicket.isPending}>
            {createTicket.isPending ? t('common.loading') : t('tickets.submit')}
          </button>
          <Link to="/my-tickets" className="btn-ghost">{t('tickets.myTickets')}</Link>
        </div>
      </form>
    </Layout>
  );
}

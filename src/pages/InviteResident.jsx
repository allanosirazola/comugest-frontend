import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import * as invitationsApi from '@/api/invitations';
import { useCommunities, useUnits } from '@/hooks/useCommunities';

export function InviteResidentPage() {
  const { t, i18n } = useTranslation();
  const [feedback, setFeedback] = useState(null);

  const { data: communities, isLoading: loadingCommunities } = useCommunities();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { relationType: 'OWNER' } });

  const selectedCommunityId = watch('communityId');
  const { data: units, isLoading: loadingUnits } = useUnits(selectedCommunityId || undefined);

  useEffect(() => {
    setValue('unitId', '');
  }, [selectedCommunityId, setValue]);

  const usedUnitIds = useMemo(() => {
    if (!units) return new Set();
    const ids = new Set();
    units.forEach((u) => {
      if (u.occupancies.length > 0) ids.add(u.id);
    });
    return ids;
  }, [units]);

  const onSubmit = async (values) => {
    setFeedback(null);
    try {
      const res = await invitationsApi.createInvitation({
        ...values,
        locale: i18n.resolvedLanguage ?? 'es',
      });
      setFeedback({ kind: 'ok', msg: t('invite.success', { email: res.sentTo }) });
      reset({ relationType: 'OWNER' });
    } catch (err) {
      setFeedback({ kind: 'err', msg: err?.response?.data?.error?.message ?? t('errors.generic') });
    }
  };

  const noCommunities = communities && communities.length === 0;

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('invite.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-olive-950">
        {t('invite.title')}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-olive-600">{t('invite.subtitle')}</p>

      {noCommunities && (
        <div className="card mt-8 max-w-2xl">
          <p className="text-sm text-olive-700">{t('invite.noCommunitiesYet')}</p>
          <Link to="/communities/new" className="btn-primary mt-4 inline-flex">
            {t('communities.createFirst')}
          </Link>
        </div>
      )}

      {!noCommunities && (
        <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 max-w-2xl space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="firstName">{t('invite.firstName')}</label>
              <input id="firstName" className="input" {...register('firstName', { required: true })} />
              {errors.firstName && <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>}
            </div>
            <div>
              <label className="label" htmlFor="lastName">{t('invite.lastName')}</label>
              <input id="lastName" className="input" {...register('lastName', { required: true })} />
              {errors.lastName && <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="email">{t('invite.email')}</label>
            <input id="email" type="email" className="input" {...register('email', { required: true })} />
            {errors.email && <p className="mt-1 text-xs text-clay-600">{t('errors.invalidEmail')}</p>}
          </div>

          <div>
            <label className="label" htmlFor="phone">{t('invite.phone')}</label>
            <input id="phone" className="input" {...register('phone')} />
          </div>

          <div>
            <label className="label" htmlFor="communityId">{t('invite.community')}</label>
            <select id="communityId" className="input" disabled={loadingCommunities} {...register('communityId', { required: true })}>
              <option value="">{t('invite.selectCommunity')}</option>
              {communities?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.city}
                </option>
              ))}
            </select>
            {errors.communityId && <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>}
          </div>

          <div>
            <label className="label" htmlFor="unitId">{t('invite.unit')}</label>
            <select id="unitId" className="input" disabled={!selectedCommunityId || loadingUnits} {...register('unitId', { required: true })}>
              <option value="">
                {!selectedCommunityId
                  ? t('invite.selectCommunityFirst')
                  : loadingUnits
                  ? t('common.loading')
                  : t('invite.selectUnit')}
              </option>
              {units?.map((u) => {
                const occupied = usedUnitIds.has(u.id);
                return (
                  <option key={u.id} value={u.id}>
                    {u.label} · {u.type.toLowerCase()}
                    {occupied ? ` (${t('invite.occupied')})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.unitId && <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>}
          </div>

          <div>
            <label className="label" htmlFor="relationType">{t('invite.relationType')}</label>
            <select id="relationType" className="input" {...register('relationType')}>
              <option value="OWNER">{t('invite.relationOwner')}</option>
              <option value="OCCUPANT">{t('invite.relationOccupant')}</option>
              <option value="BOTH">{t('invite.relationBoth')}</option>
            </select>
          </div>

          {feedback && (
            <div
              role="alert"
              className={`rounded-md px-3 py-2 text-sm ${
                feedback.kind === 'ok'
                  ? 'border border-olive-200 bg-olive-50 text-olive-800'
                  : 'border border-clay-400/40 bg-clay-400/10 text-clay-700'
              }`}
            >
              {feedback.msg}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('invite.submit')}
          </button>
        </form>
      )}
    </Layout>
  );
}

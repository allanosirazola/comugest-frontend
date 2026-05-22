import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { acceptInvitationSchema } from '@/lib/schemas';
import * as invitationsApi from '@/api/invitations';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function AcceptInvitationPage() {
  const { t } = useTranslation();
  const { applyAuthResponse } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [info, setInfo] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(acceptInvitationSchema) });

  useEffect(() => {
    if (!token) {
      setLoadError(t('auth.acceptInvitation.missingToken'));
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await invitationsApi.inspectInvitation(token);
        if (!cancelled) setInfo(data);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err?.response?.data?.error?.message ?? t('auth.acceptInvitation.invalidToken'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const onSubmit = async (values) => {
    if (!token) return;
    setServerError(null);
    try {
      const res = await invitationsApi.acceptInvitation({
        token,
        password: values.password,
        gdprAccepted: true,
      });
      applyAuthResponse(res);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">{t('common.appName')}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        {loadError && (
          <div className="card text-center">
            <h1 className="font-display text-2xl text-olive-950">{t('auth.acceptInvitation.errorTitle')}</h1>
            <p className="mt-3 text-sm text-olive-600">{loadError}</p>
          </div>
        )}

        {!loadError && !info && (
          <div className="text-center text-olive-600">{t('common.loading')}</div>
        )}

        {info && (
          <div>
            <p className="text-xs uppercase tracking-wider text-olive-600">
              {t('auth.acceptInvitation.eyebrow')}
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium leading-tight text-olive-950">
              {t('auth.acceptInvitation.title', { name: info.firstName })}
            </h1>
            <p className="mt-2 text-sm text-olive-600">
              {t('auth.acceptInvitation.subtitle', { community: info.communityName })}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div className="rounded-md border border-olive-100 bg-white px-3 py-2 text-sm text-olive-700">
                <span className="text-xs uppercase tracking-wider text-olive-500">
                  {t('auth.acceptInvitation.youremail')}
                </span>
                <div className="mt-0.5 font-medium">{info.email}</div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  {t('auth.acceptInvitation.choosePassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  {...register('password')}
                />
                <p className="mt-1 text-xs text-olive-500">{t('auth.register.passwordHelp')}</p>
                {errors.password && (
                  <p className="mt-1 text-xs text-clay-600">{errors.password.message ?? t('errors.weakPassword')}</p>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-md border border-olive-100 bg-white p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-olive-500"
                  {...register('gdprAccepted')}
                />
                <span className="text-sm text-olive-700">{t('auth.register.gdpr')}</span>
              </label>
              {errors.gdprAccepted && (
                <p className="-mt-2 text-xs text-clay-600">{errors.gdprAccepted.message}</p>
              )}

              {serverError && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                  {serverError}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('auth.acceptInvitation.submit')}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

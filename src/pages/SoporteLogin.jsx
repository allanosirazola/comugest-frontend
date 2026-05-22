import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema } from '@/lib/schemas';
import { useAuth } from '@/contexts/AuthContext';

export function SoporteLoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const user = await login(values);
      if (user?.role !== 'SUPPORT') {
        setServerError(t('auth.soporte.errorInvalid'));
        return;
      }
      navigate('/support', { replace: true });
    } catch {
      setServerError(t('auth.soporte.errorInvalid'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-olive-950">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-6 w-6 opacity-80" />
          <span className="font-display text-sm font-semibold tracking-tight text-cream-200">
            {t('common.appName')}
          </span>
          <span className="ml-1 rounded border border-olive-700 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-olive-400">
            Internal
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 pb-20">
        <h1 className="font-display text-3xl font-medium leading-tight text-cream-50">
          {t('auth.soporte.title')}
        </h1>
        <p className="mt-2 text-sm text-olive-400">{t('auth.soporte.subtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-olive-400">
              {t('auth.soporte.email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-olive-700 bg-olive-900 px-3 py-2 text-sm text-cream-100 placeholder-olive-600 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
              {...rhfRegister('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-clay-400">{t('errors.invalidEmail')}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-olive-400">
              {t('auth.soporte.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-olive-700 bg-olive-900 px-3 py-2 text-sm text-cream-100 placeholder-olive-600 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
              {...rhfRegister('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-clay-400">{t('errors.required')}</p>}
          </div>

          {serverError && (
            <div role="alert" className="rounded-md border border-clay-600/40 bg-clay-900/30 px-3 py-2 text-sm text-clay-400">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-olive-600 px-4 py-2.5 text-sm font-medium text-cream-50 transition-colors hover:bg-olive-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('auth.soporte.submit')}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-olive-600">
          <Link to="/login" className="hover:text-olive-400">
            {t('auth.soporte.backToPublic')}
          </Link>
        </p>
      </main>
    </div>
  );
}

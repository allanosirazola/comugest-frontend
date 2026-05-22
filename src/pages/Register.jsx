import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { registerSchema } from '@/lib/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'VECINO' },
  });

  const role = watch('role');

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const result = await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        role: values.role,
        locale: i18n.resolvedLanguage ?? 'es',
        gdprAccepted: true,
      });
      navigate(`/check-email?email=${encodeURIComponent(result.email)}`, { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">{t('common.appName')}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto max-w-xl px-6 pb-16">
        <h1 className="font-display text-4xl font-medium leading-tight text-olive-950">
          {t('auth.register.title')}
        </h1>
        <p className="mt-2 text-sm text-olive-600">{t('auth.register.subtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          {/* Selector de rol con dos tarjetas */}
          <fieldset>
            <legend className="label">{t('auth.register.role')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {['VECINO', 'ADMIN_FINCAS'].map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    role === r
                      ? 'border-olive-700 bg-olive-50 shadow-soft'
                      : 'border-olive-200 bg-white hover:border-olive-300'
                  }`}
                >
                  <input type="radio" value={r} {...rhfRegister('role')} className="sr-only" />
                  <div className="font-medium text-olive-900">
                    {r === 'VECINO' ? t('auth.register.roleVecino') : t('auth.register.roleAdmin')}
                  </div>
                  <div className="mt-1 text-xs text-olive-600">
                    {r === 'VECINO' ? t('auth.register.roleVecinoDesc') : t('auth.register.roleAdminDesc')}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="label">
                {t('auth.register.firstName')}
              </label>
              <input id="firstName" className="input" autoComplete="given-name" {...rhfRegister('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="label">
                {t('auth.register.lastName')}
              </label>
              <input id="lastName" className="input" autoComplete="family-name" {...rhfRegister('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">
              {t('auth.register.email')}
            </label>
            <input id="email" type="email" autoComplete="email" className="input" {...rhfRegister('email')} />
            {errors.email && <p className="mt-1 text-xs text-clay-600">{t('errors.invalidEmail')}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="label">
              {t('auth.register.phone')}
            </label>
            <input id="phone" autoComplete="tel" className="input" {...rhfRegister('phone')} />
          </div>

          <div>
            <label htmlFor="password" className="label">
              {t('auth.register.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              {...rhfRegister('password')}
            />
            <p className="mt-1 text-xs text-olive-500">{t('auth.register.passwordHelp')}</p>
            {errors.password && <p className="mt-1 text-xs text-clay-600">{t('errors.weakPassword')}</p>}
          </div>

          <label className="flex items-start gap-3 rounded-md border border-olive-100 bg-white p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-olive-500"
              {...rhfRegister('gdprAccepted')}
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
            {isSubmitting ? t('common.loading') : t('auth.register.submit')}
          </button>
        </form>

        <p className="mt-6 text-sm text-olive-600">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-olive-800 underline underline-offset-4 hover:text-olive-900">
            {t('auth.register.signIn')}
          </Link>
        </p>
      </main>
    </div>
  );
}

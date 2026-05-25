import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema } from '@/lib/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function LoginPage() {
  const { t } = useTranslation();
  const { login, completeTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);
  const [preAuthToken, setPreAuthToken] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const result = await login(values);
      if (result && result.requiresTwoFactor) {
        setPreAuthToken(result.preAuthToken);
        return;
      }
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch {
      setServerError(t('auth.login.errorInvalid'));
    }
  };

  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    setTotpError('');
    try {
      await completeTwoFactor(preAuthToken, totpCode);
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch {
      setTotpError(t('auth.twofa.error'));
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panel izquierdo: el formulario */}
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <span className="font-display text-lg font-semibold tracking-tight">
              {t('common.appName')}
            </span>
          </Link>
          <LanguageSwitcher />
        </header>

        <div className="my-auto w-full max-w-md self-center py-12">
          {preAuthToken ? (
            <>
              <h1 className="font-display text-4xl font-medium leading-tight text-olive-950">
                {t('auth.twofa.title')}
              </h1>
              <p className="mt-2 text-sm text-olive-600">{t('auth.twofa.desc')}</p>

              <form onSubmit={handleTotpSubmit} className="mt-8 space-y-5" noValidate>
                <div>
                  <label htmlFor="totp-code" className="label">
                    {t('auth.twofa.codePlaceholder')}
                  </label>
                  <input
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder={t('auth.twofa.codePlaceholder')}
                    className="input"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>

                {totpError && (
                  <div
                    role="alert"
                    className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700"
                  >
                    {totpError}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full" disabled={totpCode.length !== 6}>
                  {t('auth.twofa.submit')}
                </button>
              </form>

              <p className="mt-6 text-sm">
                <button
                  type="button"
                  onClick={() => { setPreAuthToken(null); setTotpCode(''); setTotpError(''); }}
                  className="text-olive-700 underline underline-offset-4 hover:text-olive-900"
                >
                  {t('auth.twofa.back')}
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl font-medium leading-tight text-olive-950">
                {t('auth.login.title')}
              </h1>
              <p className="mt-2 text-sm text-olive-600">{t('auth.login.subtitle')}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
                <div>
                  <label htmlFor="email" className="label">
                    {t('auth.login.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="input"
                    {...rhfRegister('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-clay-600">{t('errors.invalidEmail')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    {t('auth.login.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="input"
                    {...rhfRegister('password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-clay-600">{t('errors.required')}</p>
                  )}
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700"
                  >
                    {serverError}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading') : t('auth.login.submit')}
                </button>
              </form>

              <p className="mt-4 text-sm text-olive-600">
                <Link to="/forgot-password" className="text-olive-700 underline underline-offset-4 hover:text-olive-900">
                  {t('auth.login.forgotPassword')}
                </Link>
              </p>

              <p className="mt-6 text-sm text-olive-600">
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="font-medium text-olive-800 underline underline-offset-4 hover:text-olive-900">
                  {t('auth.login.createAccount')}
                </Link>
              </p>

              {/* Aviso para vecinos */}
              <div className="mt-6 rounded-lg border border-olive-100 bg-cream-100/60 px-4 py-3 text-sm text-olive-600">
                {t('auth.login.vecinoNote')}
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-between text-xs text-olive-400">
          <span>© {new Date().getFullYear()} {t('common.appName')}</span>
          <Link to="/soporte" className="hover:text-olive-600">
            {t('auth.login.soporteLink')} →
          </Link>
        </footer>
      </main>

      {/* Panel derecho: decorativo. Sólo visible en lg+ */}
      <aside className="relative hidden overflow-hidden bg-olive-800 lg:block">
        <DecorativeBuilding />
        <div className="absolute bottom-12 left-12 right-12 text-cream-100">
          <p className="font-display text-3xl leading-tight">
            {t('common.tagline')}
          </p>
          <p className="mt-3 max-w-sm text-sm text-cream-200/80">
            Diseñado para administradores que prefieren resolver, no archivar.
          </p>
        </div>
      </aside>
    </div>
  );
}

// SVG decorativo: edificios estilizados estilo mediterráneo
function DecorativeBuilding() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5d6c42" />
          <stop offset="100%" stopColor="#3b442e" />
        </linearGradient>
        <pattern id="grain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="30" r="0.5" fill="#faf7ec" opacity="0.15" />
          <circle cx="70" cy="60" r="0.4" fill="#faf7ec" opacity="0.1" />
          <circle cx="40" cy="80" r="0.3" fill="#faf7ec" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="600" height="800" fill="url(#sky)" />
      <rect width="600" height="800" fill="url(#grain)" />

      {/* Edificio principal */}
      <g transform="translate(120 280)" fill="#faf7ec" opacity="0.92">
        <rect x="0" y="60" width="280" height="380" />
        <polygon points="0,60 140,0 280,60" />
        {/* Ventanas */}
        {[100, 180, 260, 340].map((y) =>
          [30, 90, 150, 210].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="30" height="40" fill="#3b442e" opacity="0.85" />
          ))
        )}
        {/* Puerta */}
        <rect x="120" y="370" width="40" height="70" fill="#3b442e" />
      </g>

      {/* Edificio secundario detrás, más pequeño */}
      <g transform="translate(380 360)" fill="#d4b566" opacity="0.5">
        <rect x="0" y="40" width="160" height="300" />
        <polygon points="0,40 80,0 160,40" />
        {[80, 150, 220].map((y) =>
          [25, 75, 125].map((x) => (
            <rect key={`s-${x}-${y}`} x={x} y={y} width="20" height="28" fill="#3b442e" opacity="0.8" />
          ))
        )}
      </g>

      {/* Línea de horizonte sutil */}
      <line x1="0" y1="660" x2="600" y2="660" stroke="#faf7ec" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

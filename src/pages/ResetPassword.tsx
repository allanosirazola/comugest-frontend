import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function ResetPasswordPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) {
      setError(t('auth.reset.missingToken'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message ?? t('errors.generic'));
    } finally {
      setLoading(false);
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

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-20">
        {done ? (
          <div className="text-center">
            <h1 className="font-display text-3xl font-medium text-olive-950">{t('auth.reset.successTitle')}</h1>
            <p className="mt-3 text-sm text-olive-600">{t('auth.reset.successSubtitle')}</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl font-medium leading-tight text-olive-950">
              {t('auth.reset.title')}
            </h1>
            <p className="mt-2 text-sm text-olive-600">{t('auth.reset.subtitle')}</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="password" className="label">{t('auth.reset.newPassword')}</label>
                <input id="password" type="password" autoComplete="new-password" className="input" value={password} onChange={(e): void => setPassword(e.target.value)} required />
                <p className="mt-1 text-xs text-olive-500">{t('auth.register.passwordHelp')}</p>
              </div>
              {error && (
                <div role="alert" className="rounded-md border border-clay-400/40 bg-clay-400/10 px-3 py-2 text-sm text-clay-700">
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.reset.submit')}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

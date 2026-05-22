import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
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
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-olive-100">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-olive-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-medium text-olive-950">{t('auth.forgot.sentTitle')}</h1>
            <p className="mt-3 text-sm text-olive-600">{t('auth.forgot.sentSubtitle')}</p>
            <Link to="/login" className="btn-ghost mt-6 inline-flex">
              {t('auth.checkEmail.backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl font-medium leading-tight text-olive-950">
              {t('auth.forgot.title')}
            </h1>
            <p className="mt-2 text-sm text-olive-600">{t('auth.forgot.subtitle')}</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="label">{t('auth.login.email')}</label>
                <input id="email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.forgot.submit')}
              </button>
            </form>
            <p className="mt-6 text-sm text-olive-600">
              <Link to="/login" className="font-medium text-olive-800 underline underline-offset-4">
                {t('auth.checkEmail.backToLogin')}
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

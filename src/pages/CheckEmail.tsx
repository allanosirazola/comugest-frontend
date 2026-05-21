import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function CheckEmailPage(): JSX.Element {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const [resent, setResent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async (): Promise<void> => {
    if (!email) return;
    setIsLoading(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
    } finally {
      setIsLoading(false);
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

      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        {/* Icono de email */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-olive-100">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-olive-700" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-medium text-olive-950">{t('auth.checkEmail.title')}</h1>
        <p className="mt-3 text-sm text-olive-600">
          {t('auth.checkEmail.subtitle')}{' '}
          {email && <strong className="text-olive-900">{email}</strong>}
        </p>
        <p className="mt-2 text-xs text-olive-500">{t('auth.checkEmail.spamNote')}</p>

        <div className="mt-8 flex flex-col items-center gap-3">
          {resent ? (
            <p className="text-sm text-olive-700">{t('auth.checkEmail.resent')}</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="btn-ghost"
              disabled={isLoading || !email}
            >
              {isLoading ? t('common.loading') : t('auth.checkEmail.resend')}
            </button>
          )}

          <Link to="/login" className="text-sm text-olive-600 underline underline-offset-4 hover:text-olive-800">
            {t('auth.checkEmail.backToLogin')}
          </Link>
        </div>
      </main>
    </div>
  );
}

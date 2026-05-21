import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type Status = 'pending' | 'success' | 'error';

export function VerifyEmailPage(): JSX.Element {
  const { t } = useTranslation();
  const { applyAuthResponse } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<Status>('pending');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg(t('auth.verifyEmail.missingToken'));
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await authApi.verifyEmail(token);
        if (cancelled) return;
        applyAuthResponse(res);
        setStatus('success');
        // pequeño delay para que el usuario vea el OK antes del redirect
        setTimeout(() => navigate('/', { replace: true }), 1200);
      } catch (err) {
        if (cancelled) return;
        const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
        setErrorMsg(apiErr.response?.data?.error?.message ?? t('errors.generic'));
        setStatus('error');
      }
    })();
    return (): void => {
      cancelled = true;
    };
  }, [token, applyAuthResponse, navigate, t]);

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
        {status === 'pending' && (
          <>
            <Spinner />
            <h1 className="mt-6 font-display text-2xl font-medium text-olive-950">
              {t('auth.verifyEmail.verifying')}
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckMark />
            <h1 className="mt-6 font-display text-3xl font-medium text-olive-950">
              {t('auth.verifyEmail.successTitle')}
            </h1>
            <p className="mt-3 text-sm text-olive-600">{t('auth.verifyEmail.redirecting')}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorMark />
            <h1 className="mt-6 font-display text-3xl font-medium text-olive-950">
              {t('auth.verifyEmail.errorTitle')}
            </h1>
            <p className="mt-3 text-sm text-olive-600">{errorMsg}</p>
            <Link to="/login" className="btn-primary mt-6">
              {t('auth.checkEmail.backToLogin')}
            </Link>
          </>
        )}
      </main>
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <svg className="h-10 w-10 animate-spin text-olive-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CheckMark(): JSX.Element {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-100">
      <svg className="h-8 w-8 text-olive-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ErrorMark(): JSX.Element {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-clay-400/15">
      <svg className="h-8 w-8 text-clay-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

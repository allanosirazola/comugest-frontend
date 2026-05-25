import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STEPS = ['step1', 'step2'];

export function OnboardingWizard({ onDismiss }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  function handleCreateCommunity() {
    onDismiss();
    navigate('/communities/new');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-olive-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-olive-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-semibold text-olive-950">{t('onboarding.title')}</h2>
          <p className="mt-1 text-sm text-olive-600">{t('onboarding.subtitle')}</p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-olive-700' : 'w-2 bg-olive-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        {step === 0 && (
          <div className="rounded-xl border border-olive-100 bg-cream-50 p-5">
            <h3 className="font-display text-lg font-semibold text-olive-900">{t('onboarding.step1Title')}</h3>
            <p className="mt-2 text-sm text-olive-600">{t('onboarding.step1Desc')}</p>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-xl border border-olive-100 bg-cream-50 p-5">
            <h3 className="font-display text-lg font-semibold text-olive-900">{t('onboarding.step2Title')}</h3>
            <p className="mt-2 text-sm text-olive-600">{t('onboarding.step2Desc')}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={onDismiss}
            className="text-sm text-olive-500 underline underline-offset-2 hover:text-olive-700"
          >
            {t('onboarding.dismiss')}
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="btn-ghost text-sm"
              >
                {t('common.back')}
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn text-sm"
              >
                {t('common.next')}
              </button>
            ) : (
              <button
                onClick={handleCreateCommunity}
                className="btn text-sm"
              >
                {t('onboarding.createCommunity')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

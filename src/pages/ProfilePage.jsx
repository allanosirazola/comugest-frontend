import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, useChangePassword, useSetup2FA, useVerify2FA, useDisable2FA } from '@/hooks/useMe';
import { usePushNotifications } from '@/hooks/usePush';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('profile.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('profile.title')}</h1>

      {isLoading && <p className="mt-8 text-olive-600">{t('common.loading')}</p>}

      {profile && (
        <div className="mt-8 space-y-8">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-olive-900">{t('profile.personalData')}</h2>
              {user?.role && (
                <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-medium text-olive-700">
                  {t('profile.role')}: {user.role}
                </span>
              )}
            </div>
            <PersonalDataForm profile={profile} />
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-medium text-olive-900">{t('profile.changePassword')}</h2>
            <ChangePasswordForm />
          </div>

          <section className="card">
            <h2 className="font-display text-xl text-olive-900">{t('push.title')}</h2>
            <p className="mt-1 text-sm text-olive-600">{t('push.desc')}</p>
            <PushToggle />
          </section>

          <section className="card">
            <h2 className="font-display text-xl text-olive-900">{t('twofa.title')}</h2>
            <p className="mt-1 text-sm text-olive-600">{t('twofa.desc')}</p>
            <TwoFactorSection profile={profile} />
          </section>
        </div>
      )}
    </Layout>
  );
}

function PersonalDataForm({ profile }) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    phone: profile.phone ?? '',
    locale: profile.locale ?? 'es',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phone: profile.phone ?? '',
      locale: profile.locale ?? 'es',
    });
  }, [profile]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    const input = {
      firstName: form.firstName,
      lastName: form.lastName,
      locale: form.locale,
    };
    if (form.phone) input.phone = form.phone;
    await updateProfile.mutateAsync(input);
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-olive-700">{t('profile.firstName')}</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-olive-700">{t('profile.lastName')}</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-olive-700">{t('profile.phone')}</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="input w-full"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-olive-700">{t('profile.locale')}</label>
        <select name="locale" value={form.locale} onChange={handleChange} className="input w-full">
          <option value="es">{t('profile.localeEs')}</option>
          <option value="en">{t('profile.localeEn')}</option>
        </select>
      </div>

      {updateProfile.error && (
        <p className="text-sm text-clay-700">
          {updateProfile.error?.response?.data?.message ?? t('errors.generic')}
        </p>
      )}

      {saved && (
        <p className="text-sm text-olive-700">{t('profile.saved')}</p>
      )}

      <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
        {t('profile.saveChanges')}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setDone(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDone(false);
    await changePassword.mutateAsync(form);
    setDone(true);
    setForm({ currentPassword: '', newPassword: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-olive-700">{t('profile.currentPassword')}</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="input w-full"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-olive-700">{t('profile.newPassword')}</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          minLength={8}
          className="input w-full"
        />
      </div>

      {changePassword.error && (
        <p className="text-sm text-clay-700">
          {changePassword.error?.response?.data?.message ?? t('errors.generic')}
        </p>
      )}

      {done && (
        <p className="text-sm text-olive-700">{t('profile.passwordChanged')}</p>
      )}

      <button type="submit" disabled={changePassword.isPending} className="btn-primary">
        {t('profile.changePassword')}
      </button>
    </form>
  );
}

function PushToggle() {
  const { t } = useTranslation();
  const { supported, subscribed, loading, error, enable, disable } = usePushNotifications();

  if (!supported) {
    return <p className="mt-3 text-sm text-olive-500">{t('push.notSupported')}</p>;
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {error && (
        <p className="text-sm text-clay-600">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={subscribed ? disable : enable}
          disabled={loading}
          className={subscribed ? 'btn-ghost text-clay-600' : 'btn-primary'}
        >
          {loading ? t('common.loading') : subscribed ? t('push.disable') : t('push.enable')}
        </button>
        {subscribed && (
          <span className="text-sm text-olive-600">{t('push.enabled')}</span>
        )}
      </div>
    </div>
  );
}

function TwoFactorSection({ profile }) {
  const { t } = useTranslation();
  const setup2FA = useSetup2FA();
  const verify2FA = useVerify2FA();
  const disable2FA = useDisable2FA();

  const [step, setStep] = useState('idle'); // idle | setup | disable
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const isEnabled = profile?.totpEnabled;

  const handleSetup = async () => {
    setVerifyError('');
    const data = await setup2FA.mutateAsync();
    setSetupData(data);
    setStep('setup');
    setToken('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError('');
    try {
      await verify2FA.mutateAsync(token);
      setStep('idle');
      setSetupData(null);
      setToken('');
    } catch {
      setVerifyError(t('twofa.verifyError'));
    }
  };

  const handleDisableSubmit = async (e) => {
    e.preventDefault();
    setVerifyError('');
    try {
      await disable2FA.mutateAsync(token);
      setStep('idle');
      setToken('');
    } catch {
      setVerifyError(t('twofa.verifyError'));
    }
  };

  if (step === 'setup' && setupData) {
    return (
      <div className="mt-4 space-y-4">
        <p className="text-sm text-olive-700">{t('twofa.setupStep1')}</p>
        <img src={setupData.qrCode} alt="QR 2FA" className="h-44 w-44 rounded border border-cream-300" />
        <p className="font-mono text-xs text-olive-500 break-all">{setupData.secret}</p>
        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-sm text-olive-700">{t('twofa.setupStep2')}</p>
          <input
            value={token}
            onChange={(e) => { setToken(e.target.value); setVerifyError(''); }}
            placeholder={t('twofa.tokenPlaceholder')}
            maxLength={6}
            pattern="\d{6}"
            required
            className="input w-40"
          />
          {verifyError && <p className="text-sm text-clay-600">{verifyError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={verify2FA.isPending} className="btn-primary">
              {t('twofa.verify')}
            </button>
            <button type="button" onClick={() => { setStep('idle'); setSetupData(null); }} className="btn-ghost">
              {t('twofa.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'disable') {
    return (
      <div className="mt-4 space-y-3">
        <p className="text-sm text-olive-700">{t('twofa.disableDesc')}</p>
        <form onSubmit={handleDisableSubmit} className="space-y-3">
          <input
            value={token}
            onChange={(e) => { setToken(e.target.value); setVerifyError(''); }}
            placeholder={t('twofa.tokenPlaceholder')}
            maxLength={6}
            pattern="\d{6}"
            required
            className="input w-40"
          />
          {verifyError && <p className="text-sm text-clay-600">{verifyError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={disable2FA.isPending} className="btn-primary bg-clay-600 hover:bg-clay-700">
              {t('twofa.disableBtn')}
            </button>
            <button type="button" onClick={() => { setStep('idle'); setToken(''); }} className="btn-ghost">
              {t('twofa.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-4">
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isEnabled ? 'bg-olive-100 text-olive-700' : 'bg-cream-200 text-olive-500'}`}>
        {isEnabled ? t('twofa.enabled') : t('twofa.disabled')}
      </span>
      {isEnabled ? (
        <button
          onClick={() => { setStep('disable'); setToken(''); setVerifyError(''); }}
          className="btn-ghost text-sm text-clay-600"
        >
          {t('twofa.disableTitle')}
        </button>
      ) : (
        <button
          onClick={handleSetup}
          disabled={setup2FA.isPending}
          className="btn-primary text-sm"
        >
          {t('twofa.setup')}
        </button>
      )}
    </div>
  );
}

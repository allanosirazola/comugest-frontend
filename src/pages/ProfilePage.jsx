import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/useMe';
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

          <section className="mt-8 card">
            <h2 className="font-display text-xl text-olive-900">{t('push.title')}</h2>
            <p className="mt-1 text-sm text-olive-600">{t('push.desc')}</p>
            <PushToggle />
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

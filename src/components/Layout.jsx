import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-olive-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <span className="font-display text-lg font-semibold tracking-tight">{t('common.appName')}</span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            <NavLink to="/" className={navClass} end>
              {t('nav.dashboard')}
            </NavLink>
            {isAdmin ? (
              <>
                <NavLink to="/communities" className={navClass}>
                  {t('nav.communities')}
                </NavLink>
                <NavLink to="/admin/invite" className={navClass}>
                  {t('nav.inviteResident')}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/my-invoices" className={navClass}>
                  {t('nav.myInvoices')}
                </NavLink>
                <NavLink to="/expenses" className={navClass}>
                  {t('nav.expenses')}
                </NavLink>
                <NavLink to="/procedures" className={navClass}>
                  {t('nav.procedures')}
                </NavLink>
                <NavLink to="/announcements" className={navClass}>
                  {t('nav.board')}
                </NavLink>
              </>
            )}
            <NavLink to="/messages" className={navClass}>
              {t('nav.messages')}
            </NavLink>
            {user?.role === 'SUPPORT' && (
              <NavLink to="/support" className={navClass}>
                {t('nav.support')}
              </NavLink>
            )}
            <NavLink to="/report" className={navClass}>
              {t('nav.report')}
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden text-right text-xs md:block">
              <div className="font-medium text-olive-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-olive-500">{user?.email}</div>
            </div>
            <button onClick={() => logout()} className="btn-ghost text-xs">
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

function navClass({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-olive-100 text-olive-900' : 'text-olive-600 hover:bg-olive-50'
  }`;
}

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';
  const isSupport = user?.role === 'SUPPORT';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const masRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (masRef.current && !masRef.current.contains(e.target)) {
        setMasOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?';

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-olive-950">
      <header className="relative border-b border-olive-100 bg-white dark:border-olive-800 dark:bg-olive-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <span className="font-display text-lg font-semibold tracking-tight dark:text-cream-100">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navClass} end>
              {t('nav.dashboard')}
            </NavLink>

            {isAdmin ? (
              <>
                <NavLink to="/communities" className={navClass}>
                  {t('nav.communities')}
                </NavLink>
                <NavLink to="/messages" className={navClass}>
                  {t('nav.messages')}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/my-invoices" className={navClass}>
                  {t('nav.myInvoices')}
                </NavLink>
                <NavLink to="/announcements" className={navClass}>
                  {t('nav.board')}
                </NavLink>
                <NavLink to="/messages" className={navClass}>
                  {t('nav.messages')}
                </NavLink>
              </>
            )}

            {/* "Más" dropdown */}
            <div className="relative" ref={masRef}>
              <button
                onClick={() => setMasOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-olive-600 transition-colors hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-800"
              >
                {t('nav.more', 'Más')}
                <span className="text-xs">▾</span>
              </button>

              {masOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-olive-100 bg-white shadow-lg dark:border-olive-700 dark:bg-olive-900">
                  {isAdmin && (
                    <NavLink
                      to="/admin/invite"
                      className={dropdownNavClass}
                      onClick={() => setMasOpen(false)}
                    >
                      {t('nav.inviteResident')}
                    </NavLink>
                  )}
                  {!isAdmin && (
                    <>
                      <NavLink
                        to="/expenses"
                        className={dropdownNavClass}
                        onClick={() => setMasOpen(false)}
                      >
                        {t('nav.expenses')}
                      </NavLink>
                      <NavLink
                        to="/procedures"
                        className={dropdownNavClass}
                        onClick={() => setMasOpen(false)}
                      >
                        {t('nav.procedures')}
                      </NavLink>
                    </>
                  )}
                  <NavLink
                    to="/report"
                    className={dropdownNavClass}
                    onClick={() => setMasOpen(false)}
                  >
                    {t('nav.report')}
                  </NavLink>
                  <NavLink
                    to="/ayuda"
                    className={dropdownNavClass}
                    onClick={() => setMasOpen(false)}
                  >
                    {t('nav.help')}
                  </NavLink>
                  {isSupport && (
                    <NavLink
                      to="/support"
                      className={dropdownNavClass}
                      onClick={() => setMasOpen(false)}
                    >
                      {t('nav.support')}
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LanguageSwitcher />
            <NotificationBell />

            {/* User menu (desktop) */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-600 text-sm font-semibold text-white hover:bg-olive-700 dark:bg-olive-500 dark:hover:bg-olive-400"
                aria-label="User menu"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-olive-100 bg-white shadow-lg dark:border-olive-700 dark:bg-olive-900">
                  {/* Name / email header */}
                  <div className="border-b border-olive-100 px-4 py-3 dark:border-olive-700">
                    <div className="text-sm font-medium text-olive-900 dark:text-cream-100">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-olive-500 dark:text-olive-300">{user?.email}</div>
                  </div>

                  <NavLink
                    to="/profile"
                    className={dropdownNavClass}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </NavLink>

                  {isAdmin && (
                    <NavLink
                      to="/billing"
                      className={dropdownNavClass}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.billing', 'Facturación')}
                    </NavLink>
                  )}

                  <div className="border-t border-olive-100 dark:border-olive-700">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-olive-800"
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger (mobile only) */}
            <button
              className="rounded-md p-2 text-olive-600 hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-800 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="absolute left-0 top-full z-50 w-full border-b border-olive-100 bg-white shadow-lg dark:border-olive-700 dark:bg-olive-900 md:hidden">
            <div className="flex flex-col px-4 py-3">
              {/* User info */}
              <div className="mb-3 border-b border-olive-100 pb-3 dark:border-olive-700">
                <div className="text-sm font-medium text-olive-900 dark:text-cream-100">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-olive-500 dark:text-olive-300">{user?.email}</div>
              </div>

              <NavLink to="/" className={mobileNavClass} end onClick={closeMobileMenu}>
                {t('nav.dashboard')}
              </NavLink>

              {isAdmin ? (
                <>
                  <NavLink to="/communities" className={mobileNavClass} onClick={closeMobileMenu}>
                    {t('nav.communities')}
                  </NavLink>
                  <NavLink to="/admin/invite" className={mobileNavClass} onClick={closeMobileMenu}>
                    {t('nav.inviteResident')}
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/my-invoices" className={mobileNavClass} onClick={closeMobileMenu}>
                    {t('nav.myInvoices')}
                  </NavLink>
                  <NavLink to="/expenses" className={mobileNavClass} onClick={closeMobileMenu}>
                    {t('nav.expenses')}
                  </NavLink>
                  <NavLink to="/procedures" className={mobileNavClass} onClick={closeMobileMenu}>
                    {t('nav.procedures')}
                  </NavLink>
                  <NavLink to="/announcements" className={mobileNavClass} onClick={closeMobileMenu}>
                    {t('nav.board')}
                  </NavLink>
                </>
              )}

              <NavLink to="/messages" className={mobileNavClass} onClick={closeMobileMenu}>
                {t('nav.messages')}
              </NavLink>
              <NavLink to="/report" className={mobileNavClass} onClick={closeMobileMenu}>
                {t('nav.report')}
              </NavLink>
              <NavLink to="/profile" className={mobileNavClass} onClick={closeMobileMenu}>
                {t('nav.profile')}
              </NavLink>
              <NavLink to="/ayuda" className={mobileNavClass} onClick={closeMobileMenu}>
                {t('nav.help')}
              </NavLink>

              {isSupport && (
                <NavLink to="/support" className={mobileNavClass} onClick={closeMobileMenu}>
                  {t('nav.support')}
                </NavLink>
              )}

              {isAdmin && (
                <NavLink to="/billing" className={mobileNavClass} onClick={closeMobileMenu}>
                  {t('nav.billing', 'Facturación')}
                </NavLink>
              )}

              <div className="mt-3 border-t border-olive-100 pt-3 dark:border-olive-700">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="w-full rounded-md py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-olive-800"
                >
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 dark:text-cream-100">{children}</main>
    </div>
  );
}

function navClass({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-olive-100 text-olive-900 dark:bg-olive-800 dark:text-cream-100'
      : 'text-olive-600 hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-800'
  }`;
}

function dropdownNavClass({ isActive }) {
  return `block w-full px-4 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-olive-100 text-olive-900 dark:bg-olive-800 dark:text-cream-100'
      : 'text-olive-700 hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-800'
  }`;
}

function mobileNavClass({ isActive }) {
  return `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-olive-100 text-olive-900 dark:bg-olive-800 dark:text-cream-100'
      : 'text-olive-700 hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-800'
  }`;
}

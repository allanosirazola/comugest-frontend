import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center">
      <p className="font-display text-7xl text-olive-300">404</p>
      <h1 className="mt-2 font-display text-3xl text-olive-950">{t('errors.notFound')}</h1>
      <Link to="/" className="btn-primary mt-6">
        {t('errors.notFoundCta')}
      </Link>
    </div>
  );
}

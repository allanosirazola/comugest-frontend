import { useTranslation } from 'react-i18next';

export function LanguageSwitcher(): JSX.Element {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'es';

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-olive-200 bg-white p-0.5 text-xs">
      {(['es', 'en'] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={(): Promise<unknown> => i18n.changeLanguage(lng)}
          className={`rounded px-2 py-1 font-medium uppercase tracking-wider transition-colors ${
            current === lng ? 'bg-olive-700 text-cream-50' : 'text-olive-600 hover:bg-olive-50'
          }`}
          aria-pressed={current === lng}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}

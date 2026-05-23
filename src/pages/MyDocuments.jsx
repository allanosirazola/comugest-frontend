import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useMyDocuments } from '@/hooks/useDocuments';

const CATEGORY_COLORS = {
  ACTA: 'bg-olive-100 text-olive-800',
  REGLAMENTO: 'bg-blue-100 text-blue-800',
  PRESUPUESTO: 'bg-amber-100 text-amber-800',
  CONTRATO: 'bg-purple-100 text-purple-800',
  CERTIFICADO: 'bg-green-100 text-green-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

export function MyDocumentsPage() {
  const { t } = useTranslation();
  const { data: docs = [], isLoading } = useMyDocuments();

  if (isLoading) {
    return <Layout><p className="text-olive-600">{t('common.loading')}</p></Layout>;
  }

  // Group by community
  const grouped = docs.reduce((acc, doc) => {
    const key = doc.community.id;
    if (!acc[key]) acc[key] = { name: doc.community.name, docs: [] };
    acc[key].docs.push(doc);
    return acc;
  }, {});

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('documents.eyebrow')}</p>
      <h1 className="mt-1 font-display text-4xl font-medium text-olive-950">{t('documents.myTitle')}</h1>

      {docs.length === 0 ? (
        <p className="mt-10 text-center text-olive-500">{t('documents.empty')}</p>
      ) : (
        <div className="mt-8 space-y-10">
          {Object.values(grouped).map((group) => (
            <section key={group.name}>
              <h2 className="mb-4 font-display text-2xl text-olive-900">{group.name}</h2>
              <div className="space-y-2">
                {group.docs.map((doc) => (
                  <div key={doc.id} className="card">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CATEGORY_COLORS[doc.category]}`}>
                        {t(`documents.category.${doc.category.toLowerCase()}`)}
                      </span>
                      <span className="text-xs text-olive-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-medium text-olive-900 hover:text-olive-600 hover:underline"
                    >
                      {doc.name}
                    </a>
                    {doc.description && (
                      <p className="mt-0.5 text-sm text-olive-600">{doc.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Layout>
  );
}

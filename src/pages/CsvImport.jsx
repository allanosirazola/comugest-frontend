import { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunity } from '@/hooks/useCommunities';
import { importCsv } from '@/api/import';

const TEMPLATE_ROWS = [
  ['label', 'floor', 'door', 'ownerName', 'ownerEmail', 'ownerPhone'],
  ['1A', '1', 'A', 'Ana García López', 'ana@example.com', '+34 600 000 001'],
  ['1B', '1', 'B', 'Carlos Martín Ruiz', 'carlos@example.com', '+34 600 000 002'],
  ['2A', '2', 'A', 'María Sánchez Pérez', 'maria@example.com', ''],
];

function downloadCsv(rows, filename) {
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const { data: community } = useCommunity(communityId);
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        const rows = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
          return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));
        });
        setPreview({ headers, rows });
      } catch {
        setParseError('No se pudo leer el archivo CSV. Comprueba el formato.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importCsv(communityId, preview.rows);
      setImportResult(result);
      setPreview(null); // clear preview on success
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setImportResult({ error: err?.response?.data?.error?.message ?? 'Error al importar' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name ?? t('communities.backToList')}
      </Link>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-olive-600">Importación</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">Importar unidades y vecinos</h1>
        <p className="mt-2 text-olive-600">
          Carga un archivo CSV con las unidades y datos de los propietarios. Se importarán las unidades y se enviarán invitaciones por correo automáticamente.
        </p>
      </div>

      {/* Formato */}
      <div className="mt-8 card">
        <h2 className="font-display text-lg font-medium text-olive-900">Formato del archivo</h2>
        <p className="mt-1 text-sm text-olive-600">El CSV debe incluir estas columnas (en este orden):</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-left">
                <th className="pb-2 pr-6 font-medium text-olive-700">Columna</th>
                <th className="pb-2 pr-6 font-medium text-olive-700">Descripción</th>
                <th className="pb-2 font-medium text-olive-700">Obligatorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {[
                ['label', 'Identificador de la unidad (ej: 1A, Garaje-3)', 'Sí'],
                ['floor', 'Planta (número)', 'No'],
                ['door', 'Puerta o letra', 'No'],
                ['ownerName', 'Nombre completo del propietario', 'No'],
                ['ownerEmail', 'Email del propietario (para invitación)', 'No'],
                ['ownerPhone', 'Teléfono del propietario', 'No'],
              ].map(([col, desc, req]) => (
                <tr key={col}>
                  <td className="py-2 pr-6 font-mono text-xs text-olive-800">{col}</td>
                  <td className="py-2 pr-6 text-olive-600">{desc}</td>
                  <td className="py-2 text-olive-600">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => downloadCsv(TEMPLATE_ROWS, 'plantilla-comugest.csv')}
          className="mt-4 btn-ghost text-sm"
        >
          ↓ Descargar plantilla CSV
        </button>
      </div>

      {/* Upload */}
      <div className="mt-6 card">
        <h2 className="font-display text-lg font-medium text-olive-900">Cargar archivo</h2>
        <div
          className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 px-6 py-10 transition hover:border-olive-400"
          onClick={() => fileRef.current?.click()}
        >
          <span className="text-3xl">📂</span>
          <p className="mt-2 text-sm font-medium text-olive-700">Haz clic para seleccionar un archivo CSV</p>
          <p className="text-xs text-olive-400">Máximo 5 MB · Codificación UTF-8</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
        </div>
        {parseError && <p className="mt-3 text-sm text-clay-600">{parseError}</p>}
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-6 card">
          <h2 className="font-display text-lg font-medium text-olive-900">
            Vista previa — {preview.rows.length} unidades detectadas
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-300 text-left">
                  {preview.headers.map(h => (
                    <th key={h} className="pb-2 pr-4 font-medium text-olive-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {preview.rows.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    {preview.headers.map(h => (
                      <td key={h} className="py-1.5 pr-4 text-olive-600">{row[h] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 20 && (
              <p className="mt-2 text-xs text-olive-400">Mostrando las primeras 20 filas de {preview.rows.length}.</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {importResult?.error && (
              <p className="rounded-lg bg-clay-50 px-4 py-3 text-sm text-clay-700">{importResult.error}</p>
            )}
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-primary w-fit"
            >
              {importing ? 'Importando…' : `Importar ${preview.rows.length} unidades`}
            </button>
          </div>
        </div>
      )}

      {importResult && !importResult.error && (
        <div className="card bg-olive-50">
          <p className="font-medium text-olive-800">✓ Importación completada</p>
          <p className="mt-1 text-sm text-olive-600">
            {importResult.created} unidad(es) creada(s) · {importResult.invited} invitación(es) enviada(s)
          </p>
          {importResult.errors?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {importResult.errors.map((e, i) => (
                <li key={i} className="text-xs text-clay-600">⚠ {e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Layout>
  );
}

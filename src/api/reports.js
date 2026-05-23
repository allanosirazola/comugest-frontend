import { api } from './client';

async function downloadPdf(url, filename) {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export const downloadMorosos = (communityId) =>
  downloadPdf(`/communities/${communityId}/reports/morosos`, `morosos.pdf`);

export const downloadBudget = (communityId) =>
  downloadPdf(`/communities/${communityId}/reports/budget`, `presupuesto.pdf`);

export const downloadPayments = (communityId, from, to) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return downloadPdf(`/communities/${communityId}/reports/payments${qs}`, `pagos.pdf`);
};

async function downloadXml(url, filename) {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/xml' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export const downloadModelo347 = (communityId, year) =>
  downloadXml(`/communities/${communityId}/reports/modelo347?year=${year}`, `modelo347-${year}.xml`);

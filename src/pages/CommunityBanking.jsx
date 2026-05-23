import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useCommunity } from '@/hooks/useCommunities';
import { useBankAccounts, useAddBankAccount, useTransactions } from '@/hooks/useBanking';

export function CommunityBankingPage() {
  const { t } = useTranslation();
  const { id: communityId } = useParams();
  const { data: community } = useCommunity(communityId);
  const { data: accounts = [], isLoading } = useBankAccounts(communityId);
  const addAccount = useAddBankAccount(communityId);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ institutionName: '', iban: '' });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { data: transactions = [] } = useTransactions(communityId, selectedAccount?.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addAccount.mutateAsync({ institutionName: form.institutionName, iban: form.iban });
    setShowAdd(false);
    setForm({ institutionName: '', iban: '' });
  };

  return (
    <Layout>
      <Link to={`/communities/${communityId}`} className="text-sm text-olive-600 hover:text-olive-900">
        ← {community?.name}
      </Link>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-olive-600">Banca</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">Integración bancaria</h1>
          <p className="mt-2 text-olive-600">Conecta la cuenta bancaria de la comunidad para reconciliar pagos automáticamente.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Añadir cuenta</button>
      </div>

      {/* GoCardless setup notice */}
      <div className="mt-6 rounded-xl border border-olive-200 bg-olive-50 px-5 py-4">
        <p className="font-medium text-olive-800">🏦 Conecta tu banco via Open Banking (PSD2)</p>
        <p className="mt-1 text-sm text-olive-600">
          La integración bancaria usa GoCardless / Nordigen para acceso de lectura a movimientos bancarios.
          No se requieren credenciales de banca online. El banco autoriza el acceso directamente.
        </p>
        <p className="mt-2 text-sm text-olive-500">
          Para activar la conexión automática, el administrador de Comugest debe configurar las claves de GoCardless en el servidor.
          Por ahora puedes añadir cuentas manualmente y registrar transacciones.
        </p>
      </div>

      {isLoading && <p className="mt-8 text-olive-500">Cargando…</p>}

      {accounts.length === 0 && !isLoading && (
        <div className="mt-8 rounded-xl border border-dashed border-cream-300 px-6 py-10 text-center">
          <p className="text-olive-500">No hay cuentas bancarias conectadas.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 btn-primary">Añadir primera cuenta</button>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={`card cursor-pointer transition hover:border-olive-400 ${selectedAccount?.id === account.id ? 'border-olive-500 ring-1 ring-olive-400' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-olive-900">{account.institutionName}</p>
                  {account.iban && <p className="mt-0.5 font-mono text-xs text-olive-500">{account.iban}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  account.status === 'ACTIVE' ? 'bg-olive-100 text-olive-700' : 'bg-cream-200 text-olive-500'
                }`}>
                  {account.status === 'ACTIVE' ? 'Activa' : 'Pendiente'}
                </span>
              </div>
              <p className="mt-2 text-xs text-olive-400">{account._count?.transactions ?? 0} transacciones</p>
            </div>
          ))}
        </div>
      )}

      {/* Transactions panel */}
      {selectedAccount && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-medium text-olive-900">
            Transacciones — {selectedAccount.institutionName}
          </h2>
          {transactions.length === 0 ? (
            <p className="mt-4 text-olive-500">No hay transacciones registradas.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-300 text-left">
                    <th className="pb-2 pr-4 font-medium text-olive-700">Fecha</th>
                    <th className="pb-2 pr-4 font-medium text-olive-700">Descripción</th>
                    <th className="pb-2 pr-4 font-medium text-olive-700 text-right">Importe</th>
                    <th className="pb-2 font-medium text-olive-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="py-2 pr-4 text-olive-600">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 text-olive-800">{tx.description}</td>
                      <td className={`py-2 pr-4 text-right font-medium ${Number(tx.amount) >= 0 ? 'text-olive-700' : 'text-clay-700'}`}>
                        {Number(tx.amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="py-2">
                        {tx.reconciledAt ? (
                          <span className="text-xs text-olive-500">✓ Reconciliado</span>
                        ) : (
                          <span className="text-xs text-olive-400">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add account modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl font-medium text-olive-950">Añadir cuenta bancaria</h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-olive-700">Entidad bancaria</label>
                <input value={form.institutionName} onChange={e => setForm(p => ({...p, institutionName: e.target.value}))}
                  required className="input w-full" placeholder="Ej: CaixaBank, Santander…" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-olive-700">IBAN (opcional)</label>
                <input value={form.iban} onChange={e => setForm(p => ({...p, iban: e.target.value}))}
                  className="input w-full font-mono" placeholder="ES00 0000 0000 0000 0000 0000" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addAccount.isPending} className="btn-primary flex-1">
                  {addAccount.isPending ? 'Guardando…' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

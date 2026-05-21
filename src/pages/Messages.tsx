import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useMyCommunities } from '@/hooks/useCommunities';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useStartConversation,
} from '@/hooks/useComms';
import type { ConversationSummary } from '@/types';

export function MessagesPage(): JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_FINCAS' || user?.role === 'SUPPORT';
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Vecino sin conversación: ofrecer iniciar una por comunidad
  const { data: myCommunities } = useMyCommunities();
  const startConversation = useStartConversation();

  // Auto-seleccionar la primera conversación
  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const handleStart = async (communityId: string): Promise<void> => {
    const conv = await startConversation.mutateAsync(communityId);
    setActiveId(conv.id);
  };

  return (
    <Layout>
      <p className="text-xs uppercase tracking-wider text-olive-600">{t('messages.eyebrow')}</p>
      <h1 className="mt-1 font-display text-3xl font-medium text-olive-950">{t('messages.title')}</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Lista de conversaciones */}
        <aside className="card max-h-[70vh] overflow-y-auto p-0">
          {isLoading && <p className="p-4 text-sm text-olive-600">{t('common.loading')}</p>}

          {conversations && conversations.length === 0 && !isAdmin && (
            <div className="p-4">
              <p className="text-sm text-olive-600">{t('messages.noConversationsVecino')}</p>
              {myCommunities && myCommunities.length === 0 && (
                <p className="mt-3 text-xs text-olive-500">{t('messages.notInCommunity')}</p>
              )}
            </div>
          )}

          {/* Vecino: comunidades sin conversación abierta → botón para iniciar */}
          {!isAdmin &&
            myCommunities
              ?.filter((mc) => !conversations?.some((c) => c.communityId === mc.id))
              .map((mc) => (
                <button
                  key={mc.id}
                  onClick={(): Promise<void> => handleStart(mc.id)}
                  disabled={startConversation.isPending}
                  className="flex w-full items-center justify-between border-b border-olive-50 px-4 py-3 text-left transition-colors hover:bg-cream-100/50"
                >
                  <div>
                    <p className="text-sm font-medium text-olive-900">{mc.name}</p>
                    <p className="text-xs text-olive-500">{t('messages.startWith')}</p>
                  </div>
                  <span className="text-olive-400">+</span>
                </button>
              ))}

          {conversations && conversations.length === 0 && isAdmin && (
            <p className="p-4 text-sm text-olive-600">{t('messages.noConversationsAdmin')}</p>
          )}

          <ul>
            {conversations?.map((c) => (
              <li key={c.id}>
                <button
                  onClick={(): void => setActiveId(c.id)}
                  className={`flex w-full items-start justify-between gap-2 border-b border-olive-50 px-4 py-3 text-left transition-colors ${
                    activeId === c.id ? 'bg-olive-50' : 'hover:bg-cream-100/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-olive-900">
                      {isAdmin ? `${c.resident.firstName} ${c.resident.lastName}` : c.community.name}
                    </p>
                    <p className="truncate text-xs text-olive-500">
                      {isAdmin ? c.community.name : c.resident.email}
                    </p>
                    {c.lastMessage && (
                      <p className="mt-1 truncate text-xs text-olive-400">{c.lastMessage.body}</p>
                    )}
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-olive-700 px-1.5 text-[10px] font-medium text-cream-50">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Hilo activo */}
        <section className="card flex max-h-[70vh] flex-col p-0">
          {activeId ? (
            <ConversationThread
              conversationId={activeId}
              conversation={conversations?.find((c) => c.id === activeId)}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-olive-500">
              {isAdmin ? t('messages.selectConversation') : t('messages.startPrompt')}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function ConversationThread({
  conversationId,
  conversation,
  isAdmin,
}: {
  conversationId: string;
  conversation: ConversationSummary | undefined;
  isAdmin: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  const { data, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages.length]);

  const onSend = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    try {
      await sendMessage.mutateAsync(text);
    } catch {
      setDraft(text); // restaurar si falla
    }
  };

  return (
    <>
      <header className="border-b border-olive-100 px-4 py-3">
        <p className="font-medium text-olive-900">
          {conversation
            ? isAdmin
              ? `${conversation.resident.firstName} ${conversation.resident.lastName}`
              : conversation.community.name
            : ''}
        </p>
        {conversation && (
          <p className="text-xs text-olive-500">
            {isAdmin ? conversation.community.name : t('messages.withAdmin')}
          </p>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading && <p className="text-sm text-olive-600">{t('common.loading')}</p>}
        {data?.messages.map((m) => {
          // "Mío" = mismo lado que yo (admin↔fromAdmin)
          const mine = data.isAdmin ? m.fromAdmin : !m.fromAdmin;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? 'rounded-br-sm bg-olive-700 text-cream-50' : 'rounded-bl-sm bg-cream-200 text-olive-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-cream-200/70' : 'text-olive-500'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSend} className="flex gap-2 border-t border-olive-100 p-3">
        <input
          className="input flex-1"
          value={draft}
          onChange={(e): void => setDraft(e.target.value)}
          placeholder={t('messages.placeholder')}
        />
        <button type="submit" className="btn-primary" disabled={sendMessage.isPending || !draft.trim()}>
          {t('messages.send')}
        </button>
      </form>
    </>
  );
}

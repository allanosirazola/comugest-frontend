import { api } from './client';
import type { ConversationSummary, Message, MessagesResponse } from '@/types';

export async function listConversations(): Promise<ConversationSummary[]> {
  const { data } = await api.get<{ conversations: ConversationSummary[] }>('/messages/conversations');
  return data.conversations;
}

export async function startConversation(communityId: string): Promise<{ id: string }> {
  const { data } = await api.post<{ conversation: { id: string } }>('/messages/conversations', { communityId });
  return data.conversation;
}

export async function listMessages(conversationId: string): Promise<MessagesResponse> {
  const { data } = await api.get<MessagesResponse>(`/messages/conversations/${conversationId}/messages`);
  return data;
}

export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  const { data } = await api.post<{ message: Message }>(`/messages/conversations/${conversationId}/messages`, {
    body,
  });
  return data.message;
}

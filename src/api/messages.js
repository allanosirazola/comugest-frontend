import { api } from './client';

export async function listConversations() {
  const { data } = await api.get('/messages/conversations');
  return data.conversations;
}

export async function startConversation(communityId) {
  const { data } = await api.post('/messages/conversations', { communityId });
  return data.conversation;
}

export async function listMessages(conversationId) {
  const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
  return data;
}

export async function sendMessage(conversationId, body) {
  const { data } = await api.post(`/messages/conversations/${conversationId}/messages`, { body });
  return data.message;
}

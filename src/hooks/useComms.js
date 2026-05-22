import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as announcementsApi from '@/api/announcements';
import * as messagesApi from '@/api/messages';

// ─── Announcements ──────────────────────────────────────────

const ANN_KEYS = {
  all: ['announcements'],
  community: (id) => ['announcements', 'community', id],
  mine: () => ['announcements', 'mine'],
};

export function useCommunityAnnouncements(communityId) {
  return useQuery({
    queryKey: communityId ? ANN_KEYS.community(communityId) : ANN_KEYS.all,
    queryFn: () => announcementsApi.listCommunityAnnouncements(communityId),
    enabled: !!communityId,
  });
}

export function useMyAnnouncements() {
  return useQuery({ queryKey: ANN_KEYS.mine(), queryFn: announcementsApi.listMyAnnouncements });
}

export function useCreateAnnouncement(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => announcementsApi.createAnnouncement(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ANN_KEYS.all }),
  });
}

export function useDeleteAnnouncement(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: announcementsApi.deleteAnnouncement,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ANN_KEYS.community(communityId) }),
  });
}

// ─── Messages ───────────────────────────────────────────────

const MSG_KEYS = {
  conversations: ['conversations'],
  thread: (id) => ['conversations', id, 'messages'],
};

export function useConversations() {
  return useQuery({
    queryKey: MSG_KEYS.conversations,
    queryFn: messagesApi.listConversations,
    refetchInterval: 10_000, // polling: refrescar lista cada 10s
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: conversationId ? MSG_KEYS.thread(conversationId) : MSG_KEYS.conversations,
    queryFn: () => messagesApi.listMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5_000, // polling: hilo abierto refresca cada 5s
  });
}

export function useSendMessage(conversationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => messagesApi.sendMessage(conversationId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MSG_KEYS.thread(conversationId) });
      void qc.invalidateQueries({ queryKey: MSG_KEYS.conversations });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.startConversation,
    onSuccess: () => void qc.invalidateQueries({ queryKey: MSG_KEYS.conversations }),
  });
}

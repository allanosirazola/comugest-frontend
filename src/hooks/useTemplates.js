import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTemplates, createTemplate, deleteTemplate } from '@/api/templates';

export function useTemplates(communityId) {
  return useQuery({
    queryKey: ['templates', communityId],
    queryFn: () => listTemplates(communityId),
    enabled: !!communityId,
  });
}

export function useCreateTemplate(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTemplate(communityId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates', communityId] }),
  });
}

export function useDeleteTemplate(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId) => deleteTemplate(communityId, templateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates', communityId] }),
  });
}

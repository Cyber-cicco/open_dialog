import { invoke } from "@tauri-apps/api/core";
import { CommitGraph } from "../../bindings/CommitGraph";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";

interface CommitParams {
  projectId: string;
  message: string;
}

export function useGetLogs(projectId: string): UseQueryResult<CommitGraph, Error> {
  return useQuery({
    queryKey: ['git', 'logs', projectId],
    queryFn: async () => invoke<CommitGraph>("get_logs", { projectId }),
    enabled: !!projectId,
  });
}

export function useCommit(): UseMutationResult<void, Error, CommitParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['git', 'commit'],
    mutationFn: async ({ projectId, message }: CommitParams) =>
      invoke<void>("commit", { projectId, message }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['git', 'logs', projectId] });
    }
  });
}

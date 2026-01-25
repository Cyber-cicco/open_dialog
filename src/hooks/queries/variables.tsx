import { invoke } from "@tauri-apps/api/core";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { VariableStore } from "../../bindings/VariableStore";

export function useLoadVariables(projectId: string | undefined): UseQueryResult<VariableStore, Error> {
  return useQuery({
    queryKey: ['variables', projectId],
    queryFn: () => {
      return invoke<VariableStore>("load_variables", { projectId })
    },
    enabled: !!projectId,
  });
}

export function usePersistVariables(projectId: string | undefined): UseMutationResult<void, Error, VariableStore, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['variables', 'persist', projectId],
    mutationFn: (vars: VariableStore) => invoke<void>("persist_variables", { projectId, vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', projectId] });
    },
  });
}

export function useDeleteVariables(projectId: string| undefined): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['variables', 'delete', projectId],  // also fixed duplicate key
    mutationFn: (varId: string) => invoke<void>("delete_variable", { projectId, varId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', projectId] });
    },
  });
}

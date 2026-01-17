import { invoke } from "@tauri-apps/api/core";
import { Project } from "../../bindings/Project";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";

export function useCreateProject(): UseMutationResult<Project, Error, string, unknown> {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['projets', 'create'],
    mutationFn: async (name:string) => invoke<Project>("create_project", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets', 'all'] })
    }
  });
  return mutation;
}

export function useGetProjects(): UseQueryResult<Project[], Error> {
  const query = useQuery({
    queryKey: ['projets', 'all'],
    queryFn: async () => invoke<Project[]>("get_projects")
  })
  return query;
}


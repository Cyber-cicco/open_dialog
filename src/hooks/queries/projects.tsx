import { invoke } from "@tauri-apps/api/core";
import { Project } from "../../bindings/Project";
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from "@tanstack/react-query";

export function useCreateProject(): UseMutationResult<Project, Error, string, unknown> {
  const mutation = useMutation({
    mutationKey: ['projets', 'create'],
    mutationFn: async (name:string) => invoke<Project>("create_project", { name })
    
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


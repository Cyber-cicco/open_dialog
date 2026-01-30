import { invoke } from "@tauri-apps/api/core";
import { Character } from "../../bindings/Character";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { CharacterForm } from "../../bindings/CharacterForm";
import { ImageField } from "../../bindings/ImageField";
import { CharacterMetadata } from "../../bindings/CharacterMetadata";

interface CreateCharacterParams {
  projectId: string;
  name: string;
  order: number;
}

interface ChangeCharacterParams {
  projectId: string;
  charForm: CharacterForm;
}

interface SaveMetadataParams {
  projectId: string;
  metadata: CharacterMetadata;
}

interface DeleteCharacterParams {
  projectId: string;
  characterId: string;
}

interface UploadImageParams {
  projectId: string;
  charId: string;
  path: string;
  field: ImageField;
}

export function useCreateCharacter(): UseMutationResult<Character, Error, CreateCharacterParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['characters', 'create'],
    mutationFn: async ({ projectId, name, order }: CreateCharacterParams) =>
      invoke<Character>("create_character", { projectId, name, order }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['characters', 'all', projectId] });
    }
  });
}

export function useChangeCharacter(): UseMutationResult<Character, Error, ChangeCharacterParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['characters', 'change'],
    mutationFn: async ({ projectId, charForm }: ChangeCharacterParams) =>
      invoke<Character>("change_character", { projectId, charForm }),
    onSuccess: (character, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['characters', 'all', projectId] }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['characters', 'byId', projectId, character.id] })
      });
    }
  });
}

export function useSaveCharacterMetadata(): UseMutationResult<void, Error, SaveMetadataParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['characters', 'change'],
    mutationFn: async ({ projectId, metadata }: SaveMetadataParams) =>
      invoke<void>("persist_metadata", { projectId, metadata }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['characters', 'all', projectId] });
    }
  });
}

export function useDeleteCharacter(): UseMutationResult<void, Error, DeleteCharacterParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['characters', 'delete'],
    mutationFn: async ({ projectId, characterId }: DeleteCharacterParams) =>
      invoke<void>("delete_character", { projectId, characterId }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['characters', 'all', projectId] });
    }
  });
}

export function useUploadImage(): UseMutationResult<void, Error, UploadImageParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['characters', 'upload-image'],
    mutationFn: async ({ projectId, charId, path, field }: UploadImageParams) =>
      invoke<void>("upload_image", { projectId, charId, path, field }),
    onSuccess: (_, { projectId, charId }) => {
      queryClient.invalidateQueries({ queryKey: ['characters', 'all', projectId] }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['characters', 'byId', projectId, charId] })
      });;
    }
  });
}

export function useGetAllCharacters(projectId: string): UseQueryResult<CharacterMetadata, Error> {
  return useQuery({
    queryKey: ['characters', 'all', projectId],
    queryFn: async () => invoke<CharacterMetadata>("get_all_characters", { projectId }),
    enabled: !!projectId,
  });
}

export function useGetCharacterById(
  projectId: string,
  characterId: string
): UseQueryResult<Character, Error> {

  return useQuery({
    queryKey: ['characters', 'byId', projectId, characterId],
    queryFn: async () => invoke<Character>("get_character_by_id", { projectId, characterId }),
    enabled: !!projectId && !!characterId,
  });
}

import { invoke } from "@tauri-apps/api/core";
import { Character } from "../../bindings/Character";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { CharacterForm } from "../../bindings/CharacterForm";
import { ImageField } from "../../bindings/ImageField";

interface CreateCharacterParams {
  projectId: string;
  name: string;
}

interface ChangeCharacterParams {
  projectId: string;
  charForm: CharacterForm;
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
    mutationFn: async ({ projectId, name }: CreateCharacterParams) =>
      invoke<Character>("create_character", { projectId, name }),
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

export function useGetAllCharacters(projectId: string): UseQueryResult<Character[], Error> {
  return useQuery({
    queryKey: ['characters', 'all', projectId],
    queryFn: async () => invoke<Character[]>("get_all_characters", { projectId }),
    enabled: !!projectId,
  });
}

export function useGetCharacterById(
  projectId: string,
  characterId: string
): UseQueryResult<Character, Error> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['characters', 'byId', projectId, characterId],
    queryFn: async () => {
      let cached = queryClient.getQueryData<Character[]>(['characters', 'all', projectId]);
      
      if (!cached) {
        cached = await queryClient.fetchQuery({
          queryKey: ['characters', 'all', projectId],
          queryFn: () => invoke<Character[]>("get_all_characters", { projectId }),
        });
      }
      
      const character = cached?.find(c => c.id === characterId);
      if (!character) {
        throw new Error(`Character with id "${characterId}" not found`);
      }
      return character;
    },
    enabled: !!projectId && !!characterId,
  });
}

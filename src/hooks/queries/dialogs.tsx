import { invoke } from "@tauri-apps/api/core";
import { Dialog } from "../../bindings/Dialog";
import { DialogCreationForm } from "../../bindings/DialogCreationForm";
import { DialogMetadata } from "../../bindings/DialogMetadata";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";

interface CreateDialogParams {
  projectId: string;
  form: DialogCreationForm;
}

interface SaveDialogParams {
  projectId: string;
  dialog: Dialog;
}

interface SaveDialogContentParams {
  projectId: string;
  dialogId: string;
  nodeId: string;
  content: string;
}

export function useCreateDialog(): UseMutationResult<void, Error, CreateDialogParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['dialogs', 'create'],
    mutationFn: async ({ projectId, form }: CreateDialogParams) =>
      invoke<void>("create_dialog", { projectId, form }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['dialogs', 'metadata', projectId] });
    }
  });
}

export function useGetDialogById(projectId: string, dialogId: string): UseQueryResult<Dialog, Error> {
  return useQuery({
    queryKey: ['dialogs', 'byId', projectId, dialogId],
    queryFn: async () => invoke<Dialog>("get_dialog_by_id", { projectId, dialogId }),
    enabled: !!projectId && !!dialogId,
  });
}

export function useGetDialogMetadata(projectId: string): UseQueryResult<DialogMetadata, Error> {
  return useQuery({
    queryKey: ['dialogs', 'metadata', projectId],
    queryFn: async () => invoke<DialogMetadata>("get_dialog_metadata", { projectId }),
    enabled: !!projectId,
  });
}

export function useSaveDialog(): UseMutationResult<void, Error, SaveDialogParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['dialogs', 'save'],
    mutationFn: async ({ projectId, dialog }: SaveDialogParams) => {
      invoke<void>("save_dialog", { projectId, dialog })
    },
    onSuccess: (_, { projectId, dialog }) => {
      queryClient.invalidateQueries({ queryKey: ['dialogs', 'byId', projectId, dialog.id] });
      queryClient.invalidateQueries({ queryKey: ['dialogs', 'metadata', projectId] });
    }
  });
}

export function useSaveDialogContent(): UseMutationResult<void, Error, SaveDialogContentParams, unknown> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['dialogs', 'save-content'],
    mutationFn: async ({ projectId, dialogId, nodeId, content }: SaveDialogContentParams) =>
      invoke<void>("save_dialog_content", { projectId, dialogId, nodeId, content }),
    onSuccess: (_, { projectId, dialogId }) => {
      queryClient.invalidateQueries({ queryKey: ['dialogs', 'byId', projectId, dialogId] });
    }
  });
}

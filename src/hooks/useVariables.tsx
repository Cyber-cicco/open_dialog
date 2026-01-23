import { useMemo } from "react";
import { useDeleteVariables, useLoadVariables, usePersistVariables } from "./queries/variables"
import { GlobalCharacterVariable } from "../bindings/GlobalCharacterVariable";
import { Variable } from "../bindings/Variable";
import { VariableStore } from "../bindings/VariableStore";

export type LocalVariable = { id: string, name: string, current_state: string, potential_states: Array<string> }

export type VariableContext = {
  charToVars: Map<string, LocalVariable[]> | undefined;
  dialogToVars: Map<string, LocalVariable[]> | undefined;
  globalVars: LocalVariable[] | undefined;
  globalCharVars: GlobalCharacterVariable[] | undefined;
  isPending: boolean;
  variables: Variable[],
  error: Error | null;

  changeVariableState: (varId: string, state: string) => Promise<void>,
  addGlobalVariable: (newVar: LocalVariable) => Promise<void>
  removeVariable: (varId: string) => Promise<void>
}

export const useVariables = (projectId: string | undefined) => {
  const { data: variables, isPending, error } = useLoadVariables(projectId);
  const saveVariablesMutation = usePersistVariables(projectId);
  const deleteVariableMutation = useDeleteVariables(projectId);
  const { charToVars, dialogToVars, globalVars } = useMemo(() => {
    if (!variables) {
      return { charToVars: undefined, dialogToVars: undefined, globalVars: undefined }
    }

    const charToVars = new Map<string, LocalVariable[]>();
    const dialogToVars = new Map<string, LocalVariable[]>();
    const globalVars: LocalVariable[] = [];

    for (const variable of variables.data) {
      if ("Global" in variable) {
        const v = variable.Global;
        globalVars.push({ id: v.id, name: v.name, current_state: v.current_state, potential_states: v.potential_states });
      } else if ("GlobalChar" in variable) {
        const v = variable.GlobalChar;
        for (const charState of v.characters) {
          const localVar: LocalVariable = { id: v.id, name: v.name, current_state: charState.current_state, potential_states: v.potential_states };
          const existing = charToVars.get(charState.character_id) ?? [];
          existing.push(localVar);
          charToVars.set(charState.character_id, existing);
        }
      } else if ("Char" in variable) {
        const v = variable.Char;
        const localVar: LocalVariable = { id: v.id, name: v.name, current_state: v.current_state, potential_states: v.potential_states };
        const existing = charToVars.get(v.character_id) ?? [];
        existing.push(localVar);
        charToVars.set(v.character_id, existing);
      } else if ("Dialog" in variable) {
        const v = variable.Dialog;
        const localVar: LocalVariable = { id: v.id, name: v.name, current_state: v.current_state, potential_states: v.potential_states };
        const existing = dialogToVars.get(v.dialog_id) ?? [];
        existing.push(localVar);
        dialogToVars.set(v.dialog_id, existing);
      }
    }

    return { charToVars, dialogToVars, globalVars };
  }, [variables?.data]);

  const removeVariable = async (varId: string) => {
    await deleteVariableMutation.mutateAsync(varId);
  }

  const addGlobalVariable = async (newVar: LocalVariable) => {
    if (!variables) {
      return
    }
    const updatedVariables: VariableStore = {
      ...variables,
      data: [...variables.data, { "Global": newVar }]
    }
    await saveVariablesMutation.mutateAsync(updatedVariables)
  }

  const changeVariableState = async (varId: string, state: string) => {
    if (!variables) return;

    const updatedData = variables.data.map(variable => {
      if ("Global" in variable && variable.Global.id === varId) {
        return { Global: { ...variable.Global, current_state: state } };
      }
      if ("Char" in variable && variable.Char.id === varId) {
        return { Char: { ...variable.Char, current_state: state } };
      }
      if ("Dialog" in variable && variable.Dialog.id === varId) {
        return { Dialog: { ...variable.Dialog, current_state: state } };
      }
      return variable;
    });

    const updatedStore: VariableStore = {
      ...variables,
      data: updatedData
    };

    await saveVariablesMutation.mutateAsync(updatedStore);
  }

  return {
    charToVars,
    dialogToVars,
    globalVars,
    globalCharVars: variables?.data
      .filter(e => "GlobalChar" in e)
      .map(e => e.GlobalChar),
    isPending,
    addGlobalVariable,
    variables: variables?.data || [],
    removeVariable,
    changeVariableState,
    error,
  }
}


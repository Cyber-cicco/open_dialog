import { useGlobalState } from "../../context/global-state.context";
import { useGetDialogMetadata } from "../../hooks/queries/dialogs";
import { useGetCharacterById } from "../../hooks/queries/character";
import { LocalVariable } from "../../hooks/useVariables";
import { GlobalCharacterVariable } from "../../bindings/GlobalCharacterVariable";
import { useState } from "react";
import { Button } from "../common/buttons/base.buttons";
import { VariableModal } from "../variables/modal.variables";

export const VariablesMenu = () => {
  const { project, globalVars, globalCharVars, dialogToVars, charToVars, isPending } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const { data: dialogs } = useGetDialogMetadata(project?.id ?? "");

  if (isPending) {
    return <p className="text-text-muted text-sm p-2">Loading...</p>;
  }

  const hasNoVariables =
    (!globalVars || globalVars.length === 0) &&
    (!globalCharVars || globalCharVars.length === 0) &&
    (!dialogToVars || dialogToVars.size === 0) &&
    (!charToVars || charToVars.size === 0);

  return (
    <div className="flex min-h-full flex-col w-full overflow-y-auto space-y-4 pb-4">
      {hasNoVariables && <p className="text-text-muted text-sm p-2">No variables yet</p>}
      {globalVars && globalVars.length > 0 && (
        <VariableSection title="Global">
          {globalVars.map((v) => (
            <VariableItem key={v.id} variable={v} />
          ))}
        </VariableSection>
      )}

      {globalCharVars && globalCharVars.length > 0 && (
        <VariableSection title="Global Character">
          {globalCharVars.map((v) => (
            <GlobalCharVariableItem key={v.id} variable={v} />
          ))}
        </VariableSection>
      )}

      {dialogs && dialogToVars && dialogToVars.size > 0 && (
        <VariableSection title="Dialog">
          {Array.from(dialogToVars.entries()).map(([dialogId, vars]) => {
            const dialogName = dialogs.data?.[dialogId]?.name ?? dialogId;
            return (
              <ScopedVariableGroup key={dialogId} scopeName={dialogName}>
                {vars.map((v) => (
                  <VariableItem key={v.id} variable={v} />
                ))}
              </ScopedVariableGroup>
            );
          })}
        </VariableSection>
      )}

      {project && charToVars && charToVars.size > 0 && (
        <VariableSection title="Character">
          {Array.from(charToVars.entries()).map(([charId, vars]) => (
            <CharacterVariableGroup
              key={charId}
              projectId={project.id}
              characterId={charId}
              variables={vars}
            />
          ))}
        </VariableSection>
      )}
      <div className="grow"></div>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >New variable</Button>
      {isOpen &&
        <VariableModal isOpen={isOpen} onClose={() => {
          setIsOpen(false);
        }} />
      }
    </div>
  );
};

const VariableSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <h3 className="text-text-subtle text-xs font-medium uppercase tracking-wider px-2">{title}</h3>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const ScopedVariableGroup = ({ scopeName, children }: { scopeName: string; children: React.ReactNode }) => (
  <div className="ml-2 border-l border-base-600 pl-2 space-y-0.5">
    <span className="text-text-muted text-xs">{scopeName}</span>
    {children}
  </div>
);

const CharacterVariableGroup = ({
  projectId,
  characterId,
  variables
}: {
  projectId: string;
  characterId: string;
  variables: LocalVariable[]
}) => {
  const { data: character, isPending } = useGetCharacterById(projectId, characterId);
  const name = isPending ? "Loading..." : (character?.display_name || "unknown");

  return (
    <ScopedVariableGroup scopeName={name}>
      {variables.map((v) => (
        <VariableItem key={v.id} variable={v} />
      ))}
    </ScopedVariableGroup>
  );
};

const VariableItem = ({ variable }: { variable: LocalVariable }) => (
  <div className="flex items-center gap-2 p-1.5 rounded hover:bg-highlight-200 cursor-pointer transition-colors">
    <span className="text-text-primary text-sm truncate">{variable.name}</span>
  </div>
);

const GlobalCharVariableItem = ({ variable }: { variable: GlobalCharacterVariable }) => (
  <div className="flex items-center gap-2 p-1.5 rounded hover:bg-highlight-200 cursor-pointer transition-colors">
    <span className="text-text-primary text-sm truncate">{variable.name}</span>
  </div>
);

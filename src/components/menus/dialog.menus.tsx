import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/buttons/base.buttons";
import { useGlobalState } from "../../context/global-state.context";
import { useGetDialogMetadata } from "../../hooks/queries/dialogs";
import { DialogCreationModale } from "../dialogs/creation-modale.dialog";
import { Project } from "../../bindings/Project";
import { SimpleDialog } from "../../bindings/SimpleDialog";
import { useGetCharacterById } from "../../hooks/queries/character";
import { CharacterAvatar } from "../characters/avatar.character";

export const DialogMenu = () => {
  const { project } = useGlobalState();
  const [modalVisible, setModalVisible] = useState(false);
  const { data: metadata, error, isPending } = useGetDialogMetadata(project?.id ?? "");

  return (
    <div className="flex h-full flex-col w-full relative">
      <div className="flex-1 overflow-y-auto space-y-1">
        {isPending && <p className="text-text-muted text-sm p-2">Loading...</p>}
        {error && <p className="text-red-500 text-sm p-2">Error loading dialogs</p>}
        {metadata && Object.keys(metadata.data).length === 0 && (
          <p className="text-text-muted text-sm p-2">No dialogs yet</p>
        )}

        {metadata?.data && Object.values(metadata.data).map((dialog) =>
          dialog && (
            <DialogListItem key={dialog.id} project={project!} dialog={dialog} />
          )
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <Button fullWidth onClick={() => setModalVisible(true)}>
          New Dialog
        </Button>
      </div>

      {modalVisible && (
        <DialogCreationModale
          isOpen={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

const DialogListItem = ({ project, dialog }: { project: Project; dialog: SimpleDialog }) => {
  const { data: character, error, isPending } = useGetCharacterById(project?.id, dialog.main_character)
  
  return (
    <Link
      to={`dialog/${dialog.id}`}
      className="flex outline-none items-center focus-visible:ring-2 focus-visible:ring-blue-deep/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-surface gap-3 p-2 rounded-lg hover:bg-highlight-200 cursor-pointer transition-colors"
    >
      {isPending ? (
        <div className="w-8 h-8 rounded-full bg-base-600 animate-pulse" />
      ) : error ? (
        <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-red-400 text-xs font-medium">!</div>
      ) : (
        <CharacterAvatar project={project} character={character} />
      )}
      <span className="text-text-primary text-sm truncate">{dialog.name}</span>
    </Link>
  )
}


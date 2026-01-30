import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/buttons/base.buttons";
import { useGlobalState } from "../../context/global-state.context";
import { useGetDialogMetadata, useSaveDialogMetadata } from "../../hooks/queries/dialogs";
import { DialogCreationModale } from "../dialogs/creation-modale.dialogs";
import { Project } from "../../bindings/Project";
import { SimpleDialog } from "../../bindings/SimpleDialog";
import { useGetCharacterById } from "../../hooks/queries/character";
import { CharacterAvatar } from "../characters/avatar.character";
import { ArrowUpIcon, ArrowDownIcon } from "../common/svg/arrows.svg";
import { DialogMetadata } from "../../bindings/DialogMetadata";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon } from "../common/svg/grip.svg";

export const DialogMenu = () => {
  const { project } = useGlobalState();
  const [modalVisible, setModalVisible] = useState(false);
  const saveMetadataMutation = useSaveDialogMetadata();
  const { data: metadata, error, isPending } = useGetDialogMetadata(project?.id ?? "");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedDialogs = metadata?.data
    ? Object.values(metadata.data)
        .filter((d): d is SimpleDialog => d !== undefined)
        .sort((d1, d2) => d1.order - d2.order)
    : [];

  const reorderDialogs = (reordered: SimpleDialog[]) => {
    if (!metadata || !project) return;

    const newData = { ...metadata.data };
    reordered.forEach((dialog, index) => {
      newData[dialog.id] = { ...dialog, order: index };
    });

    const newMetadata: DialogMetadata = { ...metadata, data: newData };
    saveMetadataMutation.mutate({ projectId: project.id, dialogMetadata: newMetadata });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedDialogs.findIndex((d) => d.id === active.id);
    const newIndex = sortedDialogs.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(sortedDialogs, oldIndex, newIndex);
    reorderDialogs(reordered);
  };

  const swapOrder = (idA: string, idB: string) => {
    if (!metadata || !project) return;

    const dialogA = metadata.data[idA];
    const dialogB = metadata.data[idB];
    if (!dialogA || !dialogB) return;

    const newData = {
      ...metadata.data,
      [idA]: { ...dialogA, order: dialogB.order },
      [idB]: { ...dialogB, order: dialogA.order },
    };

    const newMetadata: DialogMetadata = { ...metadata, data: newData };
    saveMetadataMutation.mutate({ projectId: project.id, dialogMetadata: newMetadata });
  };

  const moveUp = (dialog: SimpleDialog, index: number) => {
    if (index === 0) return;
    swapOrder(dialog.id, sortedDialogs[index - 1].id);
  };

  const moveDown = (dialog: SimpleDialog, index: number) => {
    if (index >= sortedDialogs.length - 1) return;
    swapOrder(dialog.id, sortedDialogs[index + 1].id);
  };

  return (
    <div className="flex h-full flex-col w-full relative">
      <div className="flex-1 overflow-y-auto space-y-1">
        {isPending && <p className="text-text-muted text-sm p-2">Loading...</p>}
        {error && <p className="text-red-500 text-sm p-2">Error loading dialogs</p>}
        {sortedDialogs.length === 0 && !isPending && (
          <p className="text-text-muted text-sm p-2">No dialogs yet</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedDialogs.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {sortedDialogs.map((dialog, index) => (
              <SortableDialogItem
                key={dialog.id}
                project={project!}
                dialog={dialog}
                index={index}
                isFirst={index === 0}
                isLast={index === sortedDialogs.length - 1}
                onMoveUp={() => moveUp(dialog, index)}
                onMoveDown={() => moveDown(dialog, index)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <Button fullWidth onClick={() => setModalVisible(true)}>
          New Dialog
        </Button>
      </div>

      {modalVisible && (
        <DialogCreationModale
          isOpen={modalVisible}
          order={sortedDialogs.length}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

type DialogListItemProps = {
  project: Project;
  dialog: SimpleDialog;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

const SortableDialogItem = ({
  project,
  dialog,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: DialogListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dialog.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { data: character, error, isPending } = useGetCharacterById(project?.id, dialog.main_character);

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 group">
      {/* Drag handle */}
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>

      <Link
        to={`dialog/${dialog.id}`}
        className="flex-1 flex outline-none items-center focus-visible:ring-2 focus-visible:ring-blue-deep/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-surface gap-3 p-2 rounded-lg hover:bg-highlight-200 cursor-pointer transition-colors"
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

      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className={`p-0.5 rounded transition-colors ${
            isFirst ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-deep/40 hover:cursor-pointer"
          }`}
          title="Move up"
        >
          <ArrowUpIcon width={14} height={14} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className={`p-0.5 rounded transition-colors ${
            isLast ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-deep/40 hover:cursor-pointer"
          }`}
          title="Move down"
        >
          <ArrowDownIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
};

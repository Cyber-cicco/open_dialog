// character.menus.tsx
import { useState } from "react"
import { Button } from "../common/buttons/base.buttons"
import { useGlobalState } from "../../context/global-state.context"
import { useGetAllCharacters, useSaveCharacterMetadata } from "../../hooks/queries/character"
import { CharacterCreationModale } from "../characters/creation-modale.characters"
import { CharacterAvatar } from "../characters/avatar.character"
import { Link } from "react-router-dom"
import { Project } from "../../bindings/Project"
import { SimpleCharacter } from "../../bindings/SimpleCharacter"
import { CharacterMetadata } from "../../bindings/CharacterMetadata"
import { ArrowUpIcon, ArrowDownIcon } from "../common/svg/arrows.svg"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripIcon } from "../common/svg/grip.svg"

export const CharacterMenu = () => {
  const { project } = useGlobalState();
  const [modalVisible, setModaleVisible] = useState(false);
  const saveMetadataMutation = useSaveCharacterMetadata();
  const { data: metadata, error, isPending } = useGetAllCharacters(project?.id!);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedCharacters = metadata?.data
    ? Object.values(metadata.data)
        .filter((c): c is SimpleCharacter => c !== undefined)
        .sort((c1, c2) => c1.order - c2.order)
    : [];

  const reorderCharacters = (reordered: SimpleCharacter[]) => {
    if (!metadata || !project) return;

    const newData = { ...metadata.data };
    reordered.forEach((char, index) => {
      newData[char.id] = { ...char, order: index };
    });

    const newMetadata: CharacterMetadata = { ...metadata, data: newData };
    saveMetadataMutation.mutate({ projectId: project.id, metadata: newMetadata });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedCharacters.findIndex((c) => c.id === active.id);
    const newIndex = sortedCharacters.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(sortedCharacters, oldIndex, newIndex);
    reorderCharacters(reordered);
  };

  const swapOrder = (idA: string, idB: string) => {
    if (!metadata || !project) return;

    const charA = metadata.data[idA];
    const charB = metadata.data[idB];
    if (!charA || !charB) return;

    const newData = {
      ...metadata.data,
      [idA]: { ...charA, order: charB.order },
      [idB]: { ...charB, order: charA.order },
    };

    const newMetadata: CharacterMetadata = { ...metadata, data: newData };
    saveMetadataMutation.mutate({ projectId: project.id, metadata: newMetadata });
  };

  const moveUp = (char: SimpleCharacter, index: number) => {
    if (index === 0) return;
    swapOrder(char.id, sortedCharacters[index - 1].id);
  };

  const moveDown = (char: SimpleCharacter, index: number) => {
    if (index >= sortedCharacters.length - 1) return;
    swapOrder(char.id, sortedCharacters[index + 1].id);
  };

  return (
    <div className="flex h-full flex-col w-full relative">
      <h2 className="py-1">Characters</h2>
      <div className="flex-1 overflow-y-auto max-h-[90%] space-y-1">
        {isPending && <p className="text-text-muted text-sm p-2">Loading...</p>}
        {error && <p className="text-red-500 text-sm p-2">Error loading characters</p>}
        {sortedCharacters.length === 0 && !isPending && (
          <p className="text-text-muted text-sm p-2">No characters yet</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedCharacters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {sortedCharacters.map((char, index) => (
              <SortableCharacterItem
                key={char.id}
                project={project!}
                character={char}
                index={index}
                isFirst={index === 0}
                isLast={index === sortedCharacters.length - 1}
                onMoveUp={() => moveUp(char, index)}
                onMoveDown={() => moveDown(char, index)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <Button fullWidth onClick={() => setModaleVisible(true)}>
          New Character
        </Button>
      </div>

      {modalVisible && (
        <CharacterCreationModale
          isOpen={modalVisible}
          onClose={() => setModaleVisible(false)}
          order={sortedCharacters.length}
        />
      )}
    </div>
  )
}

type CharacterListItemProps = {
  project: Project;
  character: SimpleCharacter;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

const SortableCharacterItem = ({
  project,
  character,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: CharacterListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: character.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 group">
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>

      <Link
        to={`character/${character.id}`}
        className="flex-1 flex outline-none items-center focus-visible:ring-2 focus-visible:ring-blue-deep/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-surface gap-3 p-2 rounded-lg hover:bg-highlight-200 cursor-pointer transition-colors"
      >
        <CharacterAvatar project={project} character={character} />
        <span className="text-text-primary text-sm truncate">{character.display_name}</span>
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

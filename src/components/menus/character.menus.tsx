import { useState } from "react"
import { Button } from "../common/buttons/base.buttons"
import { useGlobalState } from "../../context/global-state.context"
import { Character } from "../../bindings/Character"
import { useGetAllCharacters } from "../../hooks/queries/character"
import { CharacterCreationModale } from "../characters/creation-modale.characters"
import { CharacterAvatar } from "../characters/avatar.character"
import { Link } from "react-router-dom"
import { Project } from "../../bindings/Project"

export const CharacterMenu = () => {
  const { project } = useGlobalState();
  const [modalVisible, setModaleVisible] = useState(false);
  const { data: characters, error, isPending } = useGetAllCharacters(project?.id!);

  return (
    <div className="flex h-full flex-col w-full relative">
      <div className="flex-1 overflow-y-auto space-y-1">
        {isPending && <p className="text-text-muted text-sm p-2">Loading...</p>}
        {error && <p className="text-red-500 text-sm p-2">Error loading characters</p>}
        {characters?.length === 0 && (
          <p className="text-text-muted text-sm p-2">No characters yet</p>
        )}
        {characters?.map(char => (
          <CharacterListItem key={char.id} project={project} character={char} />
        ))}
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
        />
      )}
    </div>
  )
}

const CharacterListItem = ({ project, character }: {project:Project | undefined, character: Character }) => (
  <Link to={`character/${character.id}`} className="flex outline-none items-center focus-visible:ring-2 focus-visible:ring-blue-deep/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-surface gap-3 p-2 rounded-lg hover:bg-highlight-200 cursor-pointer transition-colors">
    <CharacterAvatar project={project} character={character} />
    <span className="text-text-primary text-sm truncate">{character.display_name}</span>
  </Link>
)

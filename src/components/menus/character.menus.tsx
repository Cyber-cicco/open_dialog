import { useState } from "react"
import { Button } from "../common/buttons/base.buttons"
import { useGlobalState } from "../../context/global-state.context"
import { Character } from "../../bindings/Character"
import { useGetAllCharacters } from "../../hooks/queries/character"
import { CharacterCreationModale } from "../characters/creation-modale.characters"
import { CharacterAvatar } from "../characters/avatar.character"

export const CharacterMenu = () => {
  const { project } = useGlobalState();
  const [modalVisible, setModaleVisible] = useState(false);
  const { data: characters, error, isPending } = useGetAllCharacters(project?.id!);

  return (
    <div className="flex h-full flex-col w-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isPending && <p className="text-text-muted text-sm p-2">Loading...</p>}
        {error && <p className="text-red-500 text-sm p-2">Error loading characters</p>}
        {characters?.length === 0 && (
          <p className="text-text-muted text-sm p-2">No characters yet</p>
        )}
        {characters?.map(char => (
          <CharacterListItem key={char.id} character={char} />
        ))}
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
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

const CharacterListItem = ({ character }: { character: Character }) => (
  <div className="flex items-center gap-3 py-2 rounded-lg hover:bg-highlight-100 cursor-pointer transition-colors">
    <CharacterAvatar character={character} />
    <span className="text-text-primary text-sm truncate">{character.display_name}</span>
  </div>
)

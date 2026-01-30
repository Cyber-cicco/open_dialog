import { Character } from "../../bindings/Character"
import { Project } from "../../bindings/Project"
import { SimpleCharacter } from "../../bindings/SimpleCharacter"
import { getImageSrc } from "../common/img"

export const CharacterAvatar = ({project, character }: {project:Project | undefined, character: Character | SimpleCharacter }) => {
  if (character.portrait_link && project) { 
    const portraitSrc = getImageSrc(project, character.portrait_link)
    return (
      <img 
        src={portraitSrc!} 
        alt={character.display_name}
        className="w-10 h-10 rounded-md object-cover"
      />
    )
  }
  
  // Placeholder: initials on colored background
  const initials = character.display_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  
  return (
    <div className="w-10 h-10 rounded-md bg-blue-900 flex items-center justify-center text-text-primary text-sm font-medium">
      {initials}
    </div>
  )
}

import { Character } from "../../bindings/Character"

export const CharacterAvatar = ({ character }: { character: Character }) => {
  if (character.portrait_link) {
    return (
      <img 
        src={character.portrait_link} 
        alt={character.display_name}
        className="w-10 h-10 rounded-full object-cover"
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
    <div className="w-10 h-10 rounded-md bg-blue-700 flex items-center justify-center text-text-primary text-sm font-medium">
      {initials}
    </div>
  )
}

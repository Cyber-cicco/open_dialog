import { Character } from "../bindings/Character"

export const getInitials = (character: Character): string => {
  return character.display_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

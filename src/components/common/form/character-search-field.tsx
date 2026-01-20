import { useState, useRef, useEffect } from 'react'
import { useFieldContext } from '../../../hooks/form'
import { useGetAllCharacters } from '../../../hooks/queries/character'
import { useGlobalState } from '../../../context/global-state.context'
import { CharacterAvatar } from '../../characters/avatar.character'
import { Character } from '../../../bindings/Character'
import { KEYMAP_PRIO, useKeybindings } from '../../../context/keymap.context'

type CharacterSearchFieldProps = {
  label?: string
  required?: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export const CharacterSearchField: React.FC<CharacterSearchFieldProps> = ({
  label,
  required = false,
  inputRef,
}) => {
  const { project } = useGlobalState()
  const field = useFieldContext<string>()
  const { data: characters, isPending } = useGetAllCharacters(project?.id!)

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedCharacter = characters?.find(c => c.id === field.state.value)

  const filtered = characters?.filter(c =>
    c.display_name.toLowerCase().includes(query.toLowerCase())
  ) ?? []

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filtered.length, query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (character: Character) => {
    field.handleChange(character.id)
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    field.handleChange('')
    setQuery('')
  }

  useKeybindings({
    'ArrowDown': () => {
      if (filtered.length > 0) {
        setHighlightedIndex(i => (i + 1) % filtered.length)
      }
      return true
    },
    'ArrowUp': () => {
      if (filtered.length > 0) {
        setHighlightedIndex(i => (i - 1 + filtered.length) % filtered.length)
      }
      return true
    },
    'Enter': () => {
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex])
      }
      return true
    },
    'Escape': () => {
      setIsOpen(false)
      return true
    },
  }, { enabled: isOpen && !selectedCharacter, priority: KEYMAP_PRIO.DROPDOWN })

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-sm text-text-subtle mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {selectedCharacter ? (
        <div className="flex items-center gap-3 bg-base-overlay px-3 py-2 rounded">
          <CharacterAvatar project={project} character={selectedCharacter} />
          <span className="text-text-primary flex-1">{selectedCharacter.display_name}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-text-muted hover:text-text-primary text-sm"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={isPending ? 'Loading...' : 'Search character...'}
            className="w-full bg-base-overlay text-text-primary placeholder:text-text-muted px-3 py-2 focus:outline-none focus:bg-highlight-low transition-colors duration-150"
          />

          {isOpen && filtered.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-base-surface border border-base-600 rounded shadow-lg max-h-60 overflow-auto">
              {filtered.map((character, index) => (
                <li
                  key={character.id}
                  onClick={() => handleSelect(character)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${index === highlightedIndex
                      ? 'bg-highlight-med'
                      : 'hover:bg-highlight-low'
                    }`}
                >
                  <CharacterAvatar project={project} character={character} />
                  <span className="text-text-primary">{character.display_name}</span>
                </li>
              ))}
            </ul>
          )}

          {isOpen && query && filtered.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-base-surface border border-base-600 rounded px-3 py-2 text-text-muted text-sm">
              No characters found
            </div>
          )}
        </div>
      )}

      {field.state.meta.isDirty && field.state.meta.errors.length > 0 && (
        <div className="text-red-400 text-sm">
          {field.state.meta.errors.join(', ')}
        </div>
      )}
    </div>
  )
}

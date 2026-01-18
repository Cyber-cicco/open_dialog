// character-page.tsx
import { useParams } from "react-router-dom"
import { useGetCharacterById } from "../hooks/queries/character"
import { useGlobalState } from "../context/global-state.context"
import { useAppForm } from "../hooks/form"
import { Character } from "../bindings/Character"
import { PlusIcon } from "../components/common/svg/plus.svg"

export const CharacterPage: React.FC = () => {
  const { id } = useParams()
  const { project } = useGlobalState()
  
  if (!id || !project) {
    return <div className="text-text-primary p-4">Une erreur est survenue</div>
  }

  return <InnerCharacterPage charId={id} projectId={project.id} />
}

const InnerCharacterPage: React.FC<{ projectId: string; charId: string }> = ({ projectId, charId }) => {
  const { data: character, error, isPending } = useGetCharacterById(projectId, charId)

  if (isPending) {
    return <div className="text-text-primary p-4">Loading...</div>
  }

  if (error || !character) {
    return <div className="text-text-primary p-4">Character not found</div>
  }

  return <CharacterPanel character={character} />
}

const CharacterPanel: React.FC<{ character: Character }> = ({ character }) => {
  const form = useAppForm({
    defaultValues: {
      display_name: character.display_name,
      first_name: character.first_name ?? '',
      last_name: character.last_name ?? '',
      description: character.description ?? '',
    },
    onSubmit: async ({ value }) => {
      // Backend integration later
      console.log('Form submitted:', value)
    },
  })

  const initials = character.display_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image */}
      {character.background_link ? (
        <img
          src={character.background_link}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-base-400 to-base-200" />
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex h-full">
        {/* Left Half - Form content */}
        <div className="w-1/2 flex flex-col p-6 gap-6 h-full">
          {/* Portrait */}
          <div className="relative w-32 h-32 group flex-shrink-0">
            {character.portrait_link ? (
              <img
                src={character.portrait_link}
                alt={character.display_name}
                className="w-full h-full rounded-lg object-cover ring-2 ring-blue-deep"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-blue-900 flex items-center justify-center text-text-primary text-3xl font-medium ring-2 ring-blue-deep">
                {initials}
              </div>
            )}
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-base-primary/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
              aria-label="Add portrait"
            >
              <PlusIcon width={32} height={32} color="#9ccfd8" />
            </button>
          </div>

          {/* Text Fields */}
          <form
            className="flex flex-col gap-4 flex-1 min-h-0"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            {/* Name fields in a row */}
            <div className="grid grid-cols-3 gap-4">
              <form.AppField
                name="display_name"
                children={(field) => (
                  <field.TextField label="Display Name" placeholder="Character name" />
                )}
              />
              <form.AppField
                name="first_name"
                children={(field) => (
                  <field.TextField label="First Name" placeholder="First name" />
                )}
              />
              <form.AppField
                name="last_name"
                children={(field) => (
                  <field.TextField label="Last Name" placeholder="Last name" />
                )}
              />
            </div>

            {/* Description TextArea - Takes remaining vertical space */}
            <div className="flex-1 flex flex-col min-h-0">
              <form.AppField
                name="description"
                children={(field) => (
                  <field.TextAreaField
                    label="Description"
                    placeholder="Character background, personality, story, notes..."
                    rows={16}
                    mode="large"
                    resize="vertical"
                  />
                )}
              />
            </div>
          </form>
        </div>

        {/* Right Half - Artwork centered */}
        <div className="w-1/2 flex items-center justify-center p-6">
          <div className="relative group max-w-md w-full aspect-[3/4]">
            {character.artwork_link ? (
              <img
                src={character.artwork_link}
                alt={`${character.display_name} artwork`}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-base-surface/50 border-2 border-dashed border-base-600 flex flex-col items-center justify-center gap-3">
                <div className="text-text-muted text-6xl font-light">{initials}</div>
                <span className="text-text-muted text-sm">No artwork</span>
              </div>
            )}
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-base-primary/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
              aria-label="Add artwork"
            >
              <PlusIcon width={48} height={48} color="#9ccfd8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

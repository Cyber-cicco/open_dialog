import { useParams } from "react-router-dom"
import { useChangeCharacter, useGetCharacterById, useUploadImage } from "../hooks/queries/character"
import { useGlobalState } from "../context/global-state.context"
import { useAppForm } from "../hooks/form"
import { Character } from "../bindings/Character"
import { PlusIcon } from "../components/common/svg/plus.svg"
import { useEffect } from "react"
import { ImageField } from "../bindings/ImageField"
import { useFileExplorer } from "../hooks/useFileExplorer"
import { Project } from "../bindings/Project"
import { getImageSrc } from "../components/common/img"
import { getInitials } from "../hooks/useInitials"

export const CharacterPage: React.FC = () => {
  const { id } = useParams()
  const { project } = useGlobalState()

  if (!id || !project) {
    return <div className="text-text-primary p-4">Une erreur est survenue</div>
  }

  return <InnerCharacterPage charId={id} project={project} />
}

const InnerCharacterPage: React.FC<{ project: Project; charId: string }> = ({ project, charId }) => {
  const { data: character, error, isPending } = useGetCharacterById(project.id, charId)

  if (isPending) {
    return <div className="text-text-primary p-4">Loading...</div>
  }

  if (error || !character) {
    return <div className="text-text-primary p-4">Character not found</div>
  }

  return <CharacterPanel character={character} project={project} />
}


const CharacterPanel: React.FC<{ character: Character; project: Project }> = ({ character, project }) => {

  const characterMutation = useChangeCharacter()
  const uploadMutation = useUploadImage()
  const { openImagePicker } = useFileExplorer()

  const form = useAppForm({
    defaultValues: {
      display_name: character.display_name,
      first_name: character.first_name ?? '',
      last_name: character.last_name ?? '',
      description: character.description ?? '',
    },
    onSubmit: async ({ value }) => {
      const charForm = {
        id: character.id,
        ...value
      }
      await characterMutation.mutateAsync({
        projectId: project.id,
        charForm,
      })
    },
  })

  const handleImageUpload = async (field: ImageField) => {
    const path = await openImagePicker()
    if (!path) return

    await uploadMutation.mutateAsync({
      projectId: project.id,
      charId: character.id,
      path,
      field,
    })
  }

  const submitOnBlur = () => {
    form.handleSubmit()
  }

  useEffect(() => {
    form.reset()
  }, [character.id])

  const initials = getInitials(character);
  const portraitSrc = getImageSrc(project, character.portrait_link)
  const artworkSrc = getImageSrc(project, character.artwork_link)
  const backgroundSrc = getImageSrc(project, character.background_link)

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image */}
      {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-base-400 to-base-200" />
      )}

      {/* Background upload button (top-right corner) */}
      <button
        type="button"
        onClick={() => handleImageUpload("Background")}
        disabled={uploadMutation.isPending}
        className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded bg-base-overlay/80 hover:bg-base-500 text-text-subtle text-sm transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Change background"
      >
        {uploadMutation.isPending ? "Uploading..." : "Change Background"}
      </button>

      {/* Content overlay */}
      <div className="relative z-10 flex h-full">
        {/* Left Half - Form content */}
        <div className="w-1/2 flex flex-col p-6 gap-6 h-full">
          {/* Portrait */}
          <div className="relative w-32 h-32 group flex-shrink-0">
            {portraitSrc ? (
              <img
                src={portraitSrc}
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
              onClick={() => handleImageUpload("Portrait")}
              disabled={uploadMutation.isPending}
              className="absolute inset-0 flex items-center justify-center bg-base-primary/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer disabled:opacity-50"
              aria-label="Add portrait"
            >
              <PlusIcon width={32} height={32} color="#9ccfd8" />
            </button>
          </div>

          <form
            className="flex flex-col gap-4 flex-1 min-h-0"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              <form.AppField
                name="display_name"
                children={(field) => (
                  <field.TextField
                    label="Display Name"
                    onBlur={submitOnBlur}
                    placeholder="Character name"
                  />
                )}
              />
              <form.AppField
                name="first_name"
                children={(field) => (
                  <field.TextField
                    label="First Name"
                    placeholder="First name"
                    onBlur={submitOnBlur}
                  />
                )}
              />
              <form.AppField
                name="last_name"
                children={(field) => (
                  <field.TextField
                    label="Last Name"
                    placeholder="Last name"
                    onBlur={submitOnBlur}
                  />
                )}
              />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <form.AppField
                name="description"
                children={(field) => (
                  <field.TextAreaField
                    label="Description"
                    onBlur={submitOnBlur}
                    placeholder="Character background, personality, story, notes..."
                    fillContainer
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
            {artworkSrc ? (
              <img
                src={artworkSrc}
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
              onClick={() => handleImageUpload("Artwork")}
              disabled={uploadMutation.isPending}
              className="absolute inset-0 flex items-center justify-center bg-base-primary/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer disabled:opacity-50"
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

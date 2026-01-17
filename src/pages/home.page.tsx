import { useEffect, useState } from "react"
import { useGetProjects } from "../hooks/queries/projects"
import { formatDateFr } from "../utils/date.utils"
import { ProjectCreationButtons } from "../components/common/home/project-creation-buttons"

export const HomePage: React.FC = () => {
  const { data: projets, isPending, error } = useGetProjects()
  const [showOverlay, setShowOverlay] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (!isPending) {
      setShowOverlay(false)
      setShowSpinner(false)
      return
    }

    const overlayTimer = setTimeout(() => setShowOverlay(true), 200)
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 1000)

    return () => {
      clearTimeout(overlayTimer)
      clearTimeout(spinnerTimer)
    }
  }, [isPending])

  return (
    <div className="h-screen border-blue-deep border-2 bg-base-primary flex flex-col relative">
      {error && (
        <div className="p-4 text-red-400">Erreur: {error.message}</div>
      )}

      <div className="p-4 flex flex-col gap-2">
        {projets?.map((projet) => (
          <div
            key={projet.id}
            className="p-3 rounded bg-base-surface hover:bg-base-overlay transition-colors cursor-pointer"
          >
            <div className="text-text-primary font-medium">{projet.name}</div>
            <div className="text-text-muted text-sm"> Créé le {formatDateFr(new Date(projet.metadata.created_at))}</div>
            {projet.metadata.current_branch && (
              <div className="text-blue-primary text-xs mt-1">
                {projet.metadata.current_branch}
              </div>
            )}
          </div>
        ))}
      </div>
      {projets?.length === 0 && (
        <div className="flex w-full text-xl text-white h-full justify-center items-center">
          <div className="flex flex-col gap-2">
            Vous n'avez pas encore de projet
            <ProjectCreationButtons/>
          </div>

        </div>
      )

      }

      {isPending && showOverlay && (
        <div className="absolute inset-0 bg-white/10 rounded-md flex items-center justify-center">
          {showSpinner && (
            <div className="w-8 h-8 border-2 border-blue-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}

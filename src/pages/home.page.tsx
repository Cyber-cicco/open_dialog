import { useEffect, useState } from "react"
import { useGetProjects } from "../hooks/queries/projects"
import { formatDateFr } from "../utils/date.utils"
import { ProjectCreationButtons } from "../components/common/home/project-creation-buttons"
import { useGlobalState } from "../context/global-state.context"
import { BranchesSvg } from "../components/common/svg/branches.svg"
import { DirectorySvg } from "../components/common/svg/directory.svg"

export const HomePage: React.FC = () => {
  const { data: projets, isPending, error } = useGetProjects();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const { openProject } = useGlobalState();

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
  }, [isPending]);

  const hasProjects = projets && projets.length > 0;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-400 to-base-200" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center h-full overflow-y-auto py-12 px-8">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-lobster text-blue-primary mb-2 text-center">
            Open Dialog
          </h1>
          <p className="text-text-subtle mb-10 text-center">
            Create and manage your dialogue projects
          </p>

          {error && (
            <div className="p-4 mb-6 rounded-lg bg-red-900/20 border border-red-400/30 text-red-400 text-center">
              Erreur: {error.message}
            </div>
          )}

          {hasProjects && (
            <div className="bg-base-surface rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-text-primary">Your Projects</h2>
                <ProjectCreationButtons />
              </div>

              <div className="space-y-3">
                {projets.map((projet) => (
                  <button
                    type="button"
                    onClick={() => openProject(projet)}
                    key={projet.id}
                    aria-label={`open project ${projet.name}`}
                    className="w-full p-4 rounded-lg bg-base-overlay hover:bg-highlight-low border border-transparent hover:border-blue-deep/50 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-deep/30 flex items-center justify-center">
                        <DirectorySvg width={20} height={20} color="#9ccfd8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-text-primary font-medium group-hover:text-blue-primary transition-colors">
                          {projet.name}
                        </div>
                        <div className="text-text-muted text-sm">
                          Créé le {formatDateFr(new Date(projet.metadata.created_at))}
                        </div>
                        {projet.metadata.current_branch && (
                          <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded bg-blue-deep/20 text-blue-primary text-xs">
                            <BranchesSvg width={12} height={12} color="#9ccfd8" />
                            {projet.metadata.current_branch}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {projets?.length === 0 && (
            <div className="bg-base-surface rounded-lg p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-deep/30 flex items-center justify-center mx-auto mb-4">
                <BranchesSvg width={32} height={32} color="#9ccfd8" />
              </div>
              <h2 className="text-lg font-medium text-text-primary mb-2">
                No projects yet
              </h2>
              <p className="text-text-muted text-sm mb-6">
                Create your first project to start writing dialogues
              </p>
              <ProjectCreationButtons />
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && showOverlay && (
        <div className="absolute inset-0 z-20 bg-base-primary/60 flex items-center justify-center">
          {showSpinner && (
            <div className="w-8 h-8 border-2 border-blue-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}

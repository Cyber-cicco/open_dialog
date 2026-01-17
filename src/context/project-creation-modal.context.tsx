import { createContext, PropsWithChildren, useContext, useState, useCallback } from "react"
import { ProjectCreationModale } from "../components/common/modal/project-creation-modal"

type ContextProps = {
  open: () => void
  close: () => void
}

const ProjectCreationModalContext = createContext<ContextProps | undefined>(undefined)

export const ProjectCreationModalProvider = ({ children }: PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(false)

  const open = useCallback(() => {
    setIsVisible(true)
  }, [])

  const close = useCallback(() => {
    setIsVisible(false)
  }, [])

  const value = {
    open,
    close,
  }

  return (
    <ProjectCreationModalContext.Provider value={value}>
      {isVisible && (
        <ProjectCreationModale
          isOpen={isVisible}
          onClose={close}
        />
      )}
      {children}
    </ProjectCreationModalContext.Provider>
  )
}

export const useProjetCreationModal = () => {
  const context = useContext(ProjectCreationModalContext)
  if (context === undefined) {
    throw new Error("useEventDetailsModal must be used within a EventDetailsModalProvider")
  }
  return context
}


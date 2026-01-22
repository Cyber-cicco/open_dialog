import { createContext, useContext, useState, useCallback, PropsWithChildren } from "react"
import { Project } from "../bindings/Project"
import { useVariables, VariableContext } from "../hooks/useVariables"

type GlobalStateContextType = {
  project: Project | undefined
  openProject: (project: Project) => void
  closeProject: () => void
} & VariableContext

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined)

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [project, setProject] = useState<Project | undefined>(undefined)
  const variables = useVariables(project?.id)

  const openProject = useCallback((project: Project) => {
    setProject(project)
  }, [])

  const closeProject = useCallback(() => {
    setProject(undefined)
  }, [])

  return (
    <GlobalStateContext.Provider value={{ project, openProject, closeProject,  ...variables}}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext)
  if (!context) {
    throw new Error("useGlobalState must be used within GlobalStateProvider")
  }
  return context
}

import { createContext, useContext, useState, useCallback, PropsWithChildren } from "react"

type GlobalStateContextType = {
  projectId: string | undefined
  openProject: (id: string) => void
  closeProject: () => void
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined)

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [projectId, setProjectId] = useState<string | undefined>(undefined)

  const openProject = useCallback((id: string) => {
    setProjectId(id)
  }, [])

  const closeProject = useCallback(() => {
    setProjectId(undefined)
  }, [])

  return (
    <GlobalStateContext.Provider value={{ projectId, openProject, closeProject }}>
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

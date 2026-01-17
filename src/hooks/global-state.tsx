import { useCallback, useState } from "react"

export const useGlobalState = () => {
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

  const openProject = useCallback((id:string) => {
    setProjectId(id);
  }, [])

  const closeProject = useCallback(() => {
    setProjectId(undefined);
  }, [])

  return {
    projectId,
    closeProject,
    openProject,
  }
}

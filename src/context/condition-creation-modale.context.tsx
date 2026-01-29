import { createContext, PropsWithChildren, useContext, useState, useCallback } from "react"
import { PhylumConditionModale } from "../components/dialogs/phylum-condition-modal.dialogs"
import { Conditions } from "../bindings/Conditions"

type ContextProps = {
  open: (
    condition: Conditions,
    nodeId: string,
    conditionId: string,
  ) => void
  close: () => void
}

const PhylumCreationModalContext = createContext<ContextProps | undefined>(undefined)

export const PhylumCreationModalProvider = ({ children }: PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(false)
  const [condition, setCondition] = useState<Conditions | undefined>(undefined)
  const [nodeId, setNodeId] = useState<string>("")
  const [conditionId, setConditionId] = useState<string>("")

  const open = useCallback((
    condition: Conditions,
    nodeId: string,
    conditionId: string,
  ) => {
    setConditionId(conditionId)
    setNodeId(nodeId)
    setCondition(condition)
    setIsVisible(true)
  }, [])

  const close = useCallback(() => {
    setCondition(undefined)
    setConditionId("")
    setIsVisible(false)
  }, [])

  return (
    <PhylumCreationModalContext.Provider value={{ open, close }}>
      {isVisible && condition && (
        <PhylumConditionModale
          conditionId={conditionId}
          nodeId={nodeId}
          condition={condition}
          onClose={close}
        />
      )}
      {children}
    </PhylumCreationModalContext.Provider>
  )
}

export const usePhylumCreationModal = () => {
  const context = useContext(PhylumCreationModalContext)
  if (context === undefined) {
    throw new Error("usePhylumCreationModal must be used within a PhylumCreationModalProvider")
  }
  return context
}

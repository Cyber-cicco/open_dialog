import { createContext, PropsWithChildren, useContext, useState, useCallback } from "react"
import { PhylumConditionModale } from "../components/dialogs/phylum-condition-modal.dialogs"
import { Conditions } from "../bindings/Conditions"

type ContextProps = {
  open: (
    necessity: Conditions | undefined,
    nodeId: string,
    branchIndex: number,
  ) => void
  close: () => void
}

const PhylumCreationModalContext = createContext<ContextProps | undefined>(undefined)

export const PhylumCreationModalProvider = ({ children }: PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(false)
  const [necessity, setNecessity] = useState<Conditions | undefined>(undefined);
  const [nodeId, setNodeId] = useState<string>("");
  const [branchIndex, setBranchIndex] = useState<number>(-1);

  const open = useCallback((
    necessity: Conditions | undefined,
    nodeId: string,
    branchIndex: number,
  ) => {
    setBranchIndex(branchIndex);
    setNodeId(nodeId);
    setNecessity(necessity);
    setIsVisible(true);
  }, [])

  const close = useCallback(() => {
    setNecessity(undefined);
    setIsVisible(false);
  }, [])

  const value = {
    open,
    close,
  }

  return (
    <PhylumCreationModalContext.Provider value={value}>
      {isVisible && (
        <PhylumConditionModale
          branchIndex={branchIndex}
          nodeId={nodeId}
          condition={necessity}
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
    throw new Error("useEventDetailsModal must be used within a EventDetailsModalProvider")
  }
  return context
}


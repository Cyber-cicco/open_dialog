import { createContext, PropsWithChildren, useContext, useState, useCallback } from "react"
import { PhylumConditionModale } from "../components/dialogs/phylum-condition-modal.dialogs"
import { NecessityExpression } from "../bindings/NecessityExpression"

type ContextProps = {
  open: (necessity:NecessityExpression|undefined) => void
  close: () => void
}

const PhylumCreationModalContext = createContext<ContextProps | undefined>(undefined)

export const PhylumCreationModalProvider = ({ children }: PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(false)
  const [necessity, setNecessity] = useState<NecessityExpression | undefined>(undefined);

  const open = useCallback((necessity:NecessityExpression|undefined) => {
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
          necessity={necessity}
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


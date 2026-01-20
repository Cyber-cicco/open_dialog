import { createContext, PropsWithChildren, useRef, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { useSaveDialog, useSaveDialogContent } from "../hooks/queries/dialogs";
import { Node } from "../bindings/Node";

type DialogContextType = {
  dialog: Dialog | undefined
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const [dialog, setDialog] = useState<Dialog  | undefined>(undefined);
  // Pour créer automatiquement un edge avec l'ancien node
  const lastNodeRef = useRef<Node | undefined>(undefined);
  const saveDialogMutation = useSaveDialog();
  const saveDialogContentMutation = useSaveDialogContent();
  return (
    <DialogContext.Provider value={{dialog}}>
      {children}
    </DialogContext.Provider>
  )
}

export const useDialogContext = () => {
  function createNode() {

  }
}

import { createContext, PropsWithChildren, useRef, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { UNSAFE_getTurboStreamSingleFetchDataStrategy } from "react-router-dom";
import { useSaveDialog, useSaveDialogContent } from "../hooks/queries/dialogs";
import { Node } from "../bindings/Node";

type DialogContextType = {
  dialogId: string | undefined
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Va y avoir besoin d'une route permettant de déterminer un dialogue à afficher lors du truc
export const DialogProvider = ({ children }: PropsWithChildren) => {
  const [dialog, setDialog] = useState<Dialog  | undefined>(undefined);
  // Pour créer automatiquement un edge avec l'ancien node
  const lastNodeRef = useRef<Node | undefined>(undefined);
  const saveDialogMutation = useSaveDialog();
  const saveDialogContentMutation = useSaveDialogContent();


}

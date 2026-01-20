import { createContext, PropsWithChildren, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { UNSAFE_getTurboStreamSingleFetchDataStrategy } from "react-router-dom";
import { useSaveDialog, useSaveDialogContent } from "../hooks/queries/dialogs";

type DialogContextType = {
  dialogId: string | undefined
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const [dialog, setDialog] = useState<Dialog  | undefined>(undefined);
  const saveDialogMutation = useSaveDialog();
  const saveDialogContentMutation = useSaveDialogContent();


}

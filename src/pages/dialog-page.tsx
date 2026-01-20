import { useCallback, useState } from "react"
import { useKeybindings } from "../context/keymap.context"
import { useParams } from "react-router-dom"
import { DialogMainPanel } from "../components/dialogs/main-panel.dialogs"

export enum NodeType {
  DIALOG = 1,
  CHOICE = 2,
  PHYLUM = 3,
}

type ModalControl = {
  defaultOption: NodeType
  opened: boolean
}

export const OuterDialogPage: React.FC = () => {

  const { id } = useParams();

  const [isNewNodeModalVisible, setIsNewNodeModalVisible] = useState({
    defaultOption: NodeType.DIALOG,
    opened: false,
  });

  useKeybindings({
    "Ctrl+n": () => {
      setIsNewNodeModalVisible((prev) => {
        return { defaultOption: prev.defaultOption, opened: true }
      })
    },
  })

  return (
      <DialogMainPanel />
  )
}

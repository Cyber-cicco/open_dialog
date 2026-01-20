import { useState } from "react"
import { useKeybindings } from "../context/keymap.context"
import { useParams } from "react-router-dom"
import { DialogMainPanel } from "../components/dialogs/main-panel.dialogs"
import { NodeToolbar } from "../components/dialogs/toolbar.dialogs"

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

  const handleNodeCreate = (type: NodeType) => {
    // TODO: Implement node creation logic
    console.log("Create node of type:", type)
  }

  return (
    <div className="w-full h-full relative">
      <NodeToolbar onNodeCreate={handleNodeCreate} />
      <DialogMainPanel />
    </div>
  )
}

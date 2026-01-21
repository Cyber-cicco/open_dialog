import { DialogSvg } from "../common/svg/dialog.svg"
import { BranchesSvg } from "../common/svg/branches.svg"
import { NodeType } from "../../pages/dialog-page"
import { ChoiceSvg } from "../common/svg/choice.svg"

type NodeToolbarProps = {
  dialogName: string
  onNodeCreate?: (type: NodeType) => void
}

type ToolbarButtonProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-base-surface border border-blue-deep rounded-md 
                 hover:bg-base-overlay overflow-hidden hover:cursor-pointer transition-colors text-text-primary text-sm"
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ dialogName, onNodeCreate }) => {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <h2 className="text-text-primary text-lg font-medium mb-1">{dialogName}</h2>
      <ToolbarButton
        icon={<DialogSvg width={18} height={18} />}
        label="Dialog"
        onClick={() => onNodeCreate?.(NodeType.DIALOG)}
      />
      <ToolbarButton
        icon={<ChoiceSvg width={18} height={18} />}
        label="Choice"
        onClick={() => onNodeCreate?.(NodeType.CHOICE)}
      />
      <ToolbarButton
        icon={<BranchesSvg width={18} height={18} />}
        label="Phylum"
        onClick={() => onNodeCreate?.(NodeType.PHYLUM)}
      />
    </div>
  )
}

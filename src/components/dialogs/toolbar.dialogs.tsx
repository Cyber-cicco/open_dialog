import { DialogSvg } from "../common/svg/dialog.svg"
import { BranchesSvg } from "../common/svg/branches.svg"
import { NodeType } from "../../pages/dialog-page"
import { ChoiceSvg } from "../common/svg/choice.svg"
import { useAppForm } from "../../hooks/form"
import { useSaveDialog } from "../../hooks/queries/dialogs"
import { Dialog } from "../../bindings/Dialog"

type NodeToolbarProps = {
  dialog: Dialog
  projectId: string
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

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ dialog, projectId, onNodeCreate }) => {
  const saveDialogMutation = useSaveDialog()

  const form = useAppForm({
    defaultValues: {
      name: dialog.name,
    },
    onSubmit: async ({ value }) => {
      if (value.name === dialog.name) return
      await saveDialogMutation.mutateAsync({
        projectId,
        dialog: { ...dialog, name: value.name },
      })
    },
  })

  const submitOnBlur = () => {
    form.handleSubmit()
  }

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField
              onBlur={submitOnBlur}
              placeholder="Dialog name"
            />
          )}
        />
      </form>
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

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { DialogNode } from '../../bindings/DialogNode';
import { useAppForm } from '../../hooks/form';
import { useRef } from 'react';
import { useDialogContext } from '../../context/dialog.context';

type DialogNodeData = DialogNode & {};

export type DialogNodeType = Node<DialogNodeData, 'dialogNode'>;

export const DialogNodeComp = ({ data, selected, id }: NodeProps<DialogNodeType>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateNodeData, rootNodeId, setRootNode } = useDialogContext()
  const { character_id, content } = data;

  const form = useAppForm({
    defaultValues: {
      character_id: character_id || '',
      content: content,
    },
    onSubmit: async ({ value }) => {
      updateNodeData(id, {
        ...value,
        character_id: value.character_id || null  // Convert '' to null
      })
    }
  })

  const submitOnBlur = () => {
    form.handleSubmit()
  }

  return (
    <div className={`p-4 hover:cursor-pointer min-h-68 bg-base-surface rounded border w-90 
      ${selected ? 'border-blue-primary' : 'border-base-600'}
      ${rootNodeId === id ? 'ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}
    >
      {rootNodeId !== id && (
        <button
          type="button"
          onClick={() => setRootNode(id)}
          className="absolute top-2 right-2 p-1 rounded text-xs bg-base-600 hover:bg-blue-deep text-text-subtle hover:text-text-primary transition-colors"
          title="Set as root node"
        >
          ⚑
        </button>
      )}
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}><div className='space-y-2'>
          <form.AppField
            name="character_id"
            children={(field) => (
              <field.CharacterSearchField
                autofocus
                inputRef={inputRef}
                onBlur={submitOnBlur}
                label="Locutor"
              />
            )}
          />
          <form.AppField
            name="content"
            children={(field) => (
              <field.TextAreaField
                label="Content"
                onBlur={submitOnBlur}
                placeholder="Hello !"
                mode="normal"
                resize="vertical"
              />
            )}
          />
        </div>
      </form>
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="source" position={Position.Right} id="right-source" />
    </div>
  );
};

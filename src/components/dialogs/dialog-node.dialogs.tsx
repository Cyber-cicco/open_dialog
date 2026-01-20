import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { DialogNode } from '../../bindings/DialogNode';
import { useAppForm } from '../../hooks/form';

// Extend with any display-specific fields
type DialogNodeData = DialogNode & {
  // add UI-specific fields if needed
};

export type DialogNodeType = Node<DialogNodeData, 'dialogNode'>;

export const DialogNodeComp = ({ data, selected }: NodeProps<DialogNodeType>) => {
  // Access typed properties
  const { character_id } = data;
  const form = useAppForm({
    defaultValues: {
      character_id: character_id || '',
      content: '',
    }
  })

  return (
    <div className={`p-4 hover:cursor-pointer bg-base-surface rounded border w-90 ${selected ? 'border-blue-primary' : 'border-base-600'}`}>
      <Handle type="target" position={Position.Left} />
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}><div className='space-y-2'>
          <form.AppField
            name="character_id"
            children={(field) => (
              <field.CharacterSearchField label="Locutor" />
            )}
          />
          <form.AppField
            name="content"
            children={(field) => (
              <field.TextAreaField
                label="Content"
                placeholder="Hello !"
                mode="normal"
                resize="vertical"
              />
            )}
          />
        </div>
      </form>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

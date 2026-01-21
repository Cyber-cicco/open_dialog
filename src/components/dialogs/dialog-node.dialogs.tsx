import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { DialogNode } from '../../bindings/DialogNode';
import { useAppForm } from '../../hooks/form';
import { useEffect, useRef } from 'react';

// Extend with any display-specific fields
type DialogNodeData = DialogNode & {
  // add UI-specific fields if needed
};

export type DialogNodeType = Node<DialogNodeData, 'dialogNode'>;

export const DialogNodeComp = ({ data, selected }: NodeProps<DialogNodeType>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { character_id } = data;
  const form = useAppForm({
    defaultValues: {
      character_id: character_id || '',
      content: '',
    }
  })
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current])

  return (
    <div className={`p-4 hover:cursor-pointer min-h-68 bg-base-surface rounded border w-90 ${selected ? 'border-blue-primary' : 'border-base-600'}`}>
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}><div className='space-y-2'>
          <form.AppField
            name="character_id"
            children={(field) => (
              <field.CharacterSearchField inputRef={inputRef} label="Locutor" />
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
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="source" position={Position.Right} id="right-source" />
    </div>
  );
};

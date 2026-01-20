import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { DialogNode } from '../../bindings/DialogNode';

// Extend with any display-specific fields
type DialogNodeData = DialogNode & {
  // add UI-specific fields if needed
};

export type DialogNodeType = Node<DialogNodeData, 'dialogNode'>;

export const DialogNodeComp = ({ data, id, selected }: NodeProps<DialogNodeType>) => {
  // Access typed properties
  const { next_node, character_id, content_link } = data;

  return (
    <div className={`p-4 bg-base-surface rounded border ${selected ? 'border-blue-primary' : 'border-base-600'}`}>
      <Handle type="target" position={Position.Top} />
      <div>ID: {id}</div>
      <div>Character: {character_id ?? 'None'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

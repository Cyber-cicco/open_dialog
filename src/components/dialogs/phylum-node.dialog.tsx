import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Phylum } from '../../bindings/Phylum';
import { Conditions } from '../../bindings/Conditions';
import { useDialogContext } from '../../hooks/useDialog';
import { usePhylumCreationModal } from '../../context/condition-creation-modale.context';
import { CrossSvg } from '../common/svg/delete.svg';

type PhylumNodeData = Phylum & { isRootNode?: boolean };
export type PhylumNodeType = Node<PhylumNodeData, 'phylumNode'>;

const DEFAULT_CONDITION: Conditions = {
  priority: 0,
  name: 'default',
  necessities: null,
  next_node: null,
};

export const PhylumNode = ({ data, selected, id }: NodeProps<PhylumNodeType>) => {
  const { rootNodeId, setRootNode, updateNodeData } = useDialogContext();
  const { name, branches } = data;
  const { open } = usePhylumCreationModal();

  // Ensure default condition exists and is last
  const sortedBranches = [...branches].sort((a, b) => a.priority + b.priority);
  const hasDefault = sortedBranches.some(b => b.name === 'default');
  const displayBranches = hasDefault ? sortedBranches : [...sortedBranches, DEFAULT_CONDITION];

  const addCondition = () => {
    const newCondition: Conditions = {
      priority: branches.length,
      name: 'new',
      necessities: null,
      next_node: null,
    };
    // Insert before default (which is always last)
    const withoutDefault = branches.filter(b => b.name !== 'default');
    const defaultBranch = branches.find(b => b.name === 'default') ?? DEFAULT_CONDITION;
    updateNodeData(id, {
      branches: [...withoutDefault, newCondition, defaultBranch],
    });
  };

  const removeCondition = (idx: number) => {
    let newBranches = branches.filter((_, i) => i !== idx);
    updateNodeData(id, {
      branches: newBranches
    });
  }

  return (
    <div
      className={`p-4 bg-base-surface rounded border min-w-80
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

      {/* Target handles */}
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Right} id="right-target" style={{ top: 20 }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-base-600 pb-2">
        <span className="text-sm font-medium text-text-primary">
          {name || 'Phylum'}
        </span>
        <button
          type="button"
          onClick={addCondition}
          className="text-xs px-2 py-1 rounded bg-base-600 hover:bg-blue-deep text-text-subtle hover:text-text-primary transition-colors"
        >
          + Condition
        </button>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {displayBranches.map((condition, index) => {
          const isDefault = condition.name === 'default';
          const handleId = `condition-${index}`;

          return (
            <div
              role='button'
              onClick={() => {
                if (!isDefault) {
                  open(
                    condition,
                    id,
                    index,
                  );
                }
              }}
              key={index}
              className={`relative flex items-center justify-between p-2 rounded text-sm
                ${isDefault ? 'bg-base-700/50 text-text-muted' : 'bg-base-700 text-text-primary'}`}
            >
              <span>
                {condition.name}
              </span>
              {!isDefault &&
                <button
                  className='hover:cursor-pointer hover:bg-red-500/20'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeCondition(index);
                  }}><CrossSvg /></button>
              }
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

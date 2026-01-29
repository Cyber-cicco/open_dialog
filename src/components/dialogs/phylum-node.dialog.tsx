import { Handle, Position, type NodeProps, type Node, useUpdateNodeInternals } from '@xyflow/react';
import { Phylum } from '../../bindings/Phylum';
import { Conditions } from '../../bindings/Conditions';
import { useDialogContext } from '../../hooks/useDialog';
import { usePhylumCreationModal } from '../../context/condition-creation-modale.context';
import { CrossSvg } from '../common/svg/delete.svg';
import { ArrowUpIcon, ArrowDownIcon } from '../common/svg/arrows.svg';
import { useEffect } from 'react';

type PhylumNodeData = Phylum & { isRootNode?: boolean };
export type PhylumNodeType = Node<PhylumNodeData, 'phylumNode'>;

const createDefaultCondition = (): Conditions => ({
  id: crypto.randomUUID(),
  priority: 0,
  name: 'default',
  necessities: null,
  next_node: null,
});

export const PhylumNode = ({ data, selected, id }: NodeProps<PhylumNodeType>) => {
  const { rootNodeId, setRootNode, updateNodeData } = useDialogContext();
  const { name, branches } = data;
  const { open } = usePhylumCreationModal();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [branches, id, updateNodeInternals]);

  // Sort by priority (highest first), default always last
  const sortedBranches = [...branches].sort((a, b) => {
    if (a.name === 'default') return 1;
    if (b.name === 'default') return -1;
    return b.priority - a.priority;
  });

  const hasDefault = branches.some(b => b.name === 'default');

  const addCondition = () => {
    const newCondition: Conditions = {
      id: crypto.randomUUID(),
      priority: branches.length,
      name: 'new',
      necessities: null,
      next_node: null,
    };

    if (!hasDefault) {
      updateNodeData(id, { branches: [...branches, newCondition, createDefaultCondition()] });
    } else {
      const withoutDefault = branches.filter(b => b.name !== 'default');
      const defaultBranch = branches.find(b => b.name === 'default')!;
      updateNodeData(id, { branches: [...withoutDefault, newCondition, defaultBranch] });
    }
  };

  const removeCondition = (conditionId: string) => {
    updateNodeData(id, { branches: branches.filter(b => b.id !== conditionId) });
  };

  const swapPriorities = (idA: string, idB: string) => {
    const newBranches = branches.map(b => {
      if (b.id === idA) {
        const other = branches.find(x => x.id === idB)!;
        return { ...b, priority: other.priority };
      }
      if (b.id === idB) {
        const other = branches.find(x => x.id === idA)!;
        return { ...b, priority: other.priority };
      }
      return b;
    });
    updateNodeData(id, { branches: newBranches });
  };

  const moveConditionUp = (condition: Conditions, displayIndex: number) => {
    const above = sortedBranches[displayIndex - 1];
    if (!above || above.name === 'default') return;
    swapPriorities(condition.id, above.id);
  };

  const moveConditionDown = (condition: Conditions, displayIndex: number) => {
    const below = sortedBranches[displayIndex + 1];
    if (!below || below.name === 'default') return;
    swapPriorities(condition.id, below.id);
  };

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

      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Right} id="right-target" style={{ top: 20 }} />

      <div className="flex items-center justify-between mb-3 border-b border-base-600 pb-2">
        <span className="text-sm font-medium text-text-primary">{name || 'Phylum'}</span>
        <button
          type="button"
          onClick={addCondition}
          className="text-xs px-2 py-1 rounded bg-base-600 hover:bg-blue-deep text-text-subtle hover:text-text-primary transition-colors"
        >
          + Condition
        </button>
      </div>

      <div className="space-y-2">
        {sortedBranches.map((condition, displayIndex) => {
          const isDefault = condition.name === 'default';
          const canMoveUp = !isDefault && displayIndex > 0 && sortedBranches[displayIndex - 1]?.name !== 'default';
          const canMoveDown = !isDefault && displayIndex < sortedBranches.length - 1 && sortedBranches[displayIndex + 1]?.name !== 'default';

          return (
            <div
              role="button"
              onClick={() => !isDefault && open(condition, id, condition.id)}
              key={condition.id}
              className={`relative flex items-center justify-between p-2 rounded text-sm
                ${isDefault ? 'bg-base-700/50 text-text-muted' : 'bg-base-700 text-text-primary'}`}
            >
              <span className="flex-1">{condition.name}</span>

              {!isDefault && (
                <div className="flex items-center gap-1">
                  <button
                    className={`p-0.5 rounded transition-colors ${canMoveUp ? 'hover:bg-blue-deep/40 hover:cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (canMoveUp) moveConditionUp(condition, displayIndex); }}
                    disabled={!canMoveUp}
                    title="Increase priority"
                  >
                    <ArrowUpIcon width={16} height={16} />
                  </button>
                  <button
                    className={`p-0.5 rounded transition-colors ${canMoveDown ? 'hover:bg-blue-deep/40 hover:cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (canMoveDown) moveConditionDown(condition, displayIndex); }}
                    disabled={!canMoveDown}
                    title="Decrease priority"
                  >
                    <ArrowDownIcon width={16} height={16} />
                  </button>
                  <button
                    className="p-0.5 rounded hover:cursor-pointer hover:bg-red-500/20 transition-colors"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCondition(condition.id); }}
                    title="Remove condition"
                  >
                    <CrossSvg />
                  </button>
                </div>
              )}
              <Handle
                type="source"
                position={Position.Right}
                id={`branch-${condition.id}`}
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

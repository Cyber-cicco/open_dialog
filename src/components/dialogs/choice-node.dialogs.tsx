import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Choices } from '../../bindings/Choices';
import { Choice } from '../../bindings/Choice';
import { useDialogContext } from '../../hooks/useDialog';

type ChoicesNodeData = Choices & { isRootNode?: boolean };
export type ChoicesNodeType = Node<ChoicesNodeData, 'choiceNode'>;

const DEFAULT_CHOICE: Choice = {
  id: crypto.randomUUID(),
  content: '',
  next_node: null,
};

export const ChoiceNode = ({ data, selected, id }: NodeProps<ChoicesNodeType>) => {
  const { rootNodeId, setRootNode, updateNodeData } = useDialogContext();
  const { name, choices } = data;

  const displayChoices = choices.length > 0 ? choices : [DEFAULT_CHOICE];

  const addChoice = () => {
    const newChoice: Choice = {
      id: crypto.randomUUID(),
      content: '',
      next_node: null,
    };
    updateNodeData(id, {
      choices: [...choices, newChoice],
    });
  };

  const truncate = (text: string, maxLen = 40) =>
    text.length > maxLen ? text.slice(0, maxLen) + '…' : text;

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
        <span className="text-sm font-medium text-text-primary">
          {name || 'Choices'}
        </span>
        <button
          type="button"
          onClick={addChoice}
          className="text-xs px-2 py-1 rounded bg-base-600 hover:bg-blue-deep text-text-subtle hover:text-text-primary transition-colors"
        >
          + Choice
        </button>
      </div>

      <div className="space-y-2">
        {displayChoices.map((choice, index) => {
          const handleId = `choice-${choice.id}`;
          return (
            <div
              key={choice.id}
              className="relative flex items-center justify-between p-2 rounded text-sm bg-base-700 text-text-primary"
            >
              <span className="flex-1 truncate pr-2">
                {choice.content ? truncate(choice.content) : `Choice ${index + 1}`}
              </span>
              <button
                type="button"
                className="text-xs text-text-subtle hover:text-text-primary"
                title="Edit choice"
              >
                ✎
              </button>
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

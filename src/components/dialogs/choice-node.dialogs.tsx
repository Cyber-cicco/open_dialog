// choice-node.dialogs.tsx
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Choices } from '../../bindings/Choices';
import { Choice } from '../../bindings/Choice';
import { useDialogContext } from '../../hooks/useDialog';
import { useState, useRef, useEffect } from 'react';

type ChoicesNodeData = Choices & { isRootNode?: boolean };
export type ChoicesNodeType = Node<ChoicesNodeData, 'choiceNode'>;

export const ChoiceNode = ({ data, selected, id }: NodeProps<ChoicesNodeType>) => {
  const { rootNodeId, setRootNode, updateNodeData } = useDialogContext();
  const { choices } = data;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const addChoice = () => {
    const newChoice: Choice = {
      id: crypto.randomUUID(),
      content: '',
      next_node: null,
    };
    updateNodeData(id, { choices: [...choices, newChoice] });
  };

  const startEdit = (choice: Choice) => {
    setEditingId(choice.id);
    setEditValue(choice.content);
  };

  const commitEdit = () => {
    if (editingId === null) return;
    
    const updated = choices.map(c =>
      c.id === editingId ? { ...c, content: editValue } : c
    );
    updateNodeData(id, { choices: updated });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const deleteChoice = (choiceId: string) => {
    if (choices.length <= 1) return; // Keep at least one
    const updated = choices.filter(c => c.id !== choiceId);
    updateNodeData(id, { choices: updated });
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
        <span className="text-sm font-medium text-text-primary">Choices</span>
        <button
          type="button"
          onClick={addChoice}
          className="text-xs px-2 py-1 rounded bg-base-600 hover:bg-blue-deep text-text-subtle hover:text-text-primary transition-colors"
        >
          + Choice
        </button>
      </div>

      <div className="space-y-2">
        {choices.map((choice, index) => {
          const handleId = `choice-${choice.id}`;
          const isEditing = editingId === choice.id;

          return (
            <div
              key={choice.id}
              className="relative flex items-center gap-2 p-2 rounded text-sm bg-base-700 text-text-primary group"
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-base-overlay/60 px-2 py-1 text-sm text-text-primary rounded focus:outline-none focus:ring-1 focus:ring-blue-primary"
                  placeholder={`Choice ${index + 1}`}
                />
              ) : (
                <span
                  className="flex-1 truncate cursor-pointer hover:text-blue-primary"
                  onDoubleClick={() => startEdit(choice)}
                >
                  {choice.content ? truncate(choice.content) : `Choice ${index + 1}`}
                </span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(choice)}
                    className="p-1 text-text-subtle hover:text-text-primary"
                    title="Edit choice"
                  >
                    ✎
                  </button>
                )}
                {choices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteChoice(choice.id)}
                    className="p-1 text-text-subtle hover:text-red-400"
                    title="Delete choice"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                style={{ top: '50%' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

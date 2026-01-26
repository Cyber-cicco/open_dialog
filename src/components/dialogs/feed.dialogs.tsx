import { useGlobalState } from "../../context/global-state.context";
import { DialogFlowNode, ChoicesFlowNode, AppNode } from "../../context/dialog.context";
import { useDialogContext } from "../../hooks/useDialog";
import { DialogNodeItem } from "./dialog-node-item.dialog";
import { ChoiceNodeItem } from "./choice-node-item.dialogs";
import { useRightPanel } from "../../context/right-panel.context";
import { useEffect } from "react";

const DialogFeed = () => {
  const { dialogFeed: nodes, dialog } = useDialogContext();
  const { project } = useGlobalState();
  const { setCurrentSpeaker } = useRightPanel();

  // Build character lookup for dialog nodes only
  const getCharacterIdForNode = (node: DialogFlowNode, index: number, allNodes: AppNode[]): string => {
    if (node.data.character_id) return node.data.character_id;

    // Walk back through all nodes to find last character
    for (let i = index - 1; i >= 0; i--) {
      const prev = allNodes[i];
      if (prev?.type === "dialogNode") {
        const charId = (prev as DialogFlowNode).data.character_id;
        if (charId) return charId;
      }
    }

    return dialog?.main_character ?? "";
  };

  useEffect(() => {
    const dialogNodes = nodes.filter((n) => n.type === "dialogNode") as DialogFlowNode[];
    for (let i = dialogNodes.length - 1; i >= 0; i--) {
      const charId = dialogNodes[i]?.data.character_id;
      if (charId) {
        setCurrentSpeaker(charId);
        return;
      }
    }
    setCurrentSpeaker(dialog?.main_character ?? null);
  }, [nodes, dialog?.main_character, setCurrentSpeaker]);

  return (
    <div className="dialog-feed-container">
      <div className="dialog-feed-gradient" />
      <div className="dialog-feed-content">
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          const isFirst = index === 0;

          if (node.type === "dialogNode") {
            return (
              <DialogNodeItem
                key={node.id}
                project={project}
                node={node as DialogFlowNode}
                characterId={getCharacterIdForNode(node as DialogFlowNode, index, nodes)}
                isLast={isLast}
                isFirst={isFirst}
              />
            );
          }

          if (node.type === "choiceNode") {
            const nextNode = nodes[index + 1];
            return (
              <ChoiceNodeItem
                key={node.id}
                node={node as ChoicesFlowNode}
                isLast={isLast}
                isFirst={isFirst}
                nextNodeId={nextNode?.id}
              />
            );
          }

          return null;
        })}

        {nodes.length === 0 && (
          <div className="text-text-subtle text-sm italic">No dialog nodes</div>
        )}
      </div>
      <div className="dialog-feed-gradient-bottom" />
    </div>
  );
};

export default DialogFeed;

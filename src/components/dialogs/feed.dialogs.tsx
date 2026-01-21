import { useDialogContext } from "../../context/dialog.context";

const DialogFeed = () => {
  const { dialogFeed:nodes } = useDialogContext();
  console.log(nodes)

  return (
    <div className="flex flex-col gap-3">
      {nodes.map((node) => {
        if (node.type !== "dialogNode") return null;

        const { content, character_id } = node.data;

        return (
          <div
            key={node.id}
            className="p-3 rounded bg-base-700 border border-base-600"
          >
            {character_id && (
              <div className="text-sm font-medium text-text-subtle mb-1">
                {character_id}
              </div>
            )}
            <div className="text-text-primary">
              {content || <span className="text-text-subtle italic">Empty</span>}
            </div>
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="text-text-subtle text-sm italic">No dialog nodes</div>
      )}
    </div>
  );
};

export default DialogFeed;

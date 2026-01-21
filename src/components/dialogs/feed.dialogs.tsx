import { useDialogContext } from "../../context/dialog.context";

const DialogFeed = () => {
  const { dialogFeed: nodes } = useDialogContext();

  const dialogNodes = nodes.filter((node) => node.type === "dialogNode");

  return (
    <div className="dialog-feed-container">
      <div className="dialog-feed-gradient" />
      <div className="dialog-feed-content">
        {dialogNodes.map((node, index) => {
          const { content, character_id } = node.data;
          const isLast = index === dialogNodes.length - 1;
          const isFirst = index === 0

          return (
            <div key={node.id}>
              {isFirst && <div className="m-[50%]"></div>}
              <div
                className={`p-3 rounded border transition-all duration-200 text-lg ${isLast
                  ? "bg-base-600 border-blue-deep text-text-100 shadow-lg shadow-blue-deep/20"
                  : "bg-base-700/60 border-base-700 text-gray-300"
                  }`}
              >
                {character_id && (
                  <div
                    className={`text-base font-medium mb-1 ${isLast ? "text-blue-primary" : "text-text-muted"
                      }`}
                  >
                    {character_id}
                  </div>
                )}
                <div className="whitespace-pre-wrap">
                  {content || (
                    <span className="text-text-muted italic">Empty</span>
                  )}
                </div>
              </div >
            </div>
          );
        })}

        {dialogNodes.length === 0 && (
          <div className="text-text-subtle text-sm italic">No dialog nodes</div>
        )}
      </div>
      <div className="dialog-feed-gradient-bottom" />
    </div>
  );
};

export default DialogFeed;

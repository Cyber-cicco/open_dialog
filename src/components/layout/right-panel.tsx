import { useRightPanel } from "../../context/right-panel.context";
import DialogFeed from "../dialogs/feed.dialogs";

const LayoutRightPanel = () => {
  const { isOpen, content, closePanel, openPanel } = useRightPanel();

  const panelContent = content ?? <DialogFeed />;

  return (
    <div className="relative h-full">
      <button
        onClick={() => (isOpen ? closePanel() : openPanel(panelContent))}
        className="absolute top-1/2 -translate-y-1/2 -left-5 z-10 h-24 w-5 -translate-x-1 bg-base-surface border border-base-600 border-r-0 rounded-l-md hover:bg-highlight-med transition-colors flex items-center justify-center text-text-subtle hover:text-text-primary"
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        <span className="text-xs">{isOpen ? "›" : "‹"}</span>
      </button>

      <div
        className={`right-panel-content rounded-l-sm h-full bg-base-surface text-white ${isOpen ? "open" : "closed"}`}
      >
        <div className="p-4 border-base-100 border-2 h-full overflow-y-auto">
          <DialogFeed />
        </div>
      </div>
    </div>
  );
};

export default LayoutRightPanel;

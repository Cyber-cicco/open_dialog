// right-panel.tsx
import { useRightPanel } from "../../context/right-panel.context";
import { useDialogContext } from "../../context/dialog.context";
import { useGlobalState } from "../../context/global-state.context";
import { useGetCharacterById } from "../../hooks/queries/character";
import DialogFeed from "../dialogs/feed.dialogs";
import { getImageSrc } from "../common/img";

const FloatingPortrait = () => {
  const { isOpen } = useRightPanel();
  const { dialogFeed, dialog } = useDialogContext();
  const { project } = useGlobalState();

  // Get the last speaking character (same logic as feed)
  const dialogNodes = dialogFeed.filter((node) => node.type === "dialogNode");
  const lastCharacterId = (() => {
    for (let i = dialogNodes.length - 1; i >= 0; i--) {
      const charId = dialogNodes[i]?.data.character_id;
      if (charId) return charId;
    }
    return dialog?.main_character ?? "";
  })();

  const { data: character } = useGetCharacterById(project?.id ?? "", lastCharacterId);


  if (!character || !project) return null;

  const portraitSrc = getImageSrc(project, character.portrait_link)

  return (
    <div
      className={`absolute border-5 border-blue-deep z-50 top-4 p-2 py-8 rounded-md bg-base-primary transition-all duration-300 ease-out ${isOpen
        ? "-left-39 opacity-100 scale-100"
        : "-left-20 opacity-0 scale-90 pointer-events-none"
        }`}
    >
      <div className="w-32 h-32 rounded-lg bg-base-surface shadow-lg shadow-blue-deep/30 overflow-hidden">
        {character.portrait_link && project ? (
          <img
            src={portraitSrc!}
            alt={character.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-900 flex items-center justify-center text-text-primary text-2xl font-medium">
            {character.display_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

const LayoutRightPanel = () => {
  const { isOpen, content, closePanel, openPanel } = useRightPanel();

  const panelContent = content ?? <DialogFeed />;

  return (
    <div className="relative h-full">
      {<FloatingPortrait />}

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
        <div className="h-full overflow-hidden">
          <DialogFeed />
        </div>
      </div>
    </div>
  );
};

export default LayoutRightPanel;

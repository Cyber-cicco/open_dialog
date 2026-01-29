import { useRightPanel } from "../../context/right-panel.context";
import { useGlobalState } from "../../context/global-state.context";
import { useGetCharacterById } from "../../hooks/queries/character";
import { PlayMode } from "../dialogs/play-mode.dialogs";
import { getImageSrc } from "../common/img";

const FloatingPortrait = () => {
  const { isOpen, currentSpeakerId } = useRightPanel();
  const { project } = useGlobalState();

  const { data: character } = useGetCharacterById(project?.id ?? "", currentSpeakerId ?? "");

  if (!character || !project || !currentSpeakerId) return null;

  const portraitSrc = getImageSrc(project, character.portrait_link);

  return (
    <div
      className={`absolute border-5 border-blue-deep z-50 top-4 p-2 py-8 rounded-md bg-base-primary transition-all duration-300 ease-out ${isOpen
        ? "-left-39 opacity-100 scale-100"
        : "-left-20 opacity-0 scale-90 pointer-events-none"
        }`}>
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
    </div >
  );
};

const LayoutRightPanel = () => {
  const { isOpen, content, closePanel, openPanel } = useRightPanel();

  const panelContent = content ?? <PlayMode />;

  return (
    <div className="relative h-full">
      {content && <FloatingPortrait />}

      <button
        onClick={() => (isOpen ? closePanel() : openPanel(panelContent))}
        className="absolute top-1/2 -translate-y-1/2 hover:cursor-pointer -left-5 z-10 h-24 w-5 -translate-x-1 bg-base-surface border border-base-600 border-r-0 rounded-l-md hover:bg-highlight-med transition-colors flex items-center justify-center text-text-subtle hover:text-text-primary"
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        <span className="text-xs">{isOpen ? "›" : "‹"}</span>
      </button>

      <div
        className={`right-panel-content rounded-l-sm h-full bg-base-surface text-white flex flex-col ${isOpen ? "open" : "closed"
          }`}
      >
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <PlayMode />
        </div>
      </div>
    </div>
  );
};

export default LayoutRightPanel;

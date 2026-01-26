// src/components/layout/right-panel.tsx
import { useState } from "react";
import { useRightPanel } from "../../context/right-panel.context";
import { useGlobalState } from "../../context/global-state.context";
import { useGetCharacterById } from "../../hooks/queries/character";
import DialogFeed from "../dialogs/feed.dialogs";
import { PlayMode } from "../dialogs/play-mode.dialogs";
import { getImageSrc } from "../common/img";

type PanelMode = "feed" | "play";

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

const ModeToggle = ({ mode, setMode }: { mode: PanelMode; setMode: (m: PanelMode) => void }) => (
  <div className="flex gap-1 p-1 bg-base-400 rounded">
    <button
      onClick={() => setMode("feed")}
      className={`px-3 py-1 text-xs rounded transition-colors ${mode === "feed"
        ? "bg-blue-deep text-text-primary"
        : "text-text-subtle hover:text-text-primary"
        }`}
    >
      Feed
    </button>
    <button
      onClick={() => setMode("play")}
      className={`px-3 py-1 text-xs rounded transition-colors ${mode === "play"
        ? "bg-blue-deep text-text-primary"
        : "text-text-subtle hover:text-text-primary"
        }`}
    >
      Play
    </button>
  </div>
);

const LayoutRightPanel = () => {
  const { isOpen, content, closePanel, openPanel } = useRightPanel();
  const [mode, setMode] = useState<PanelMode>("feed");

  const panelContent = content ?? <DialogFeed />;

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
        {/* Header with mode toggle */}
        <div className="flex justify-end p-2 border-b border-base-600">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mode === "feed" ? <DialogFeed /> : <PlayMode key={mode} />}
        </div>
      </div>
    </div>
  );
};

export default LayoutRightPanel;

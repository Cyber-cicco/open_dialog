import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type RightPanelContextType = {
  isOpen: boolean;
  content: ReactNode | null;
  openPanel: (content?: ReactNode) => void;
  closePanel: () => void;
  togglePanel: () => void;
  setContent: (content: ReactNode) => void;
};

const RightPanelContext = createContext<RightPanelContextType | null>(null);

export const RightPanelProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContentState] = useState<ReactNode | null>(null);

  const openPanel = useCallback((newContent?: ReactNode) => {
    if (newContent !== undefined) {
      setContentState(newContent);
    }
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setContent = useCallback((content: ReactNode) => {
    setContentState(content);
  }, []);

  return (
    <RightPanelContext.Provider value={{ isOpen, content, openPanel, closePanel, togglePanel, setContent }}>
      {children}
    </RightPanelContext.Provider>
  );
};

export const useRightPanel = () => {
  const ctx = useContext(RightPanelContext);
  if (!ctx) throw new Error("useRightPanel must be used within RightPanelProvider");
  return ctx;
};

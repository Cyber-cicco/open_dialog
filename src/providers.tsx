import { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectCreationModalProvider } from "./context/project-creation-modal.context";
import { GlobalStateProvider } from "./context/global-state.context";
import { KeymapProvider } from "./context/keymap.context";
import { DialogProvider } from "./context/dialog.context";
import { RightPanelProvider } from "./context/right-panel.context";
import { PhylumCreationModalProvider } from "./context/condition-creation-modale.context";
import { ConfirmationProvider } from "./context/confirmation-modal.context";


export const Providers = ({ children }: PropsWithChildren) => {
  const query_client = new QueryClient();
  return (
    <QueryClientProvider client={query_client}>
      <GlobalStateProvider>
        <KeymapProvider>
          <ProjectCreationModalProvider>
            <ConfirmationProvider>
              <DialogProvider>
                <PhylumCreationModalProvider>
                  <RightPanelProvider>
                    {children}
                  </RightPanelProvider>
                </PhylumCreationModalProvider>
              </DialogProvider>
            </ConfirmationProvider>
          </ProjectCreationModalProvider>
        </KeymapProvider>
      </GlobalStateProvider>
    </QueryClientProvider>
  )
}


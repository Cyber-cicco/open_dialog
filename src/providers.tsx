import { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectCreationModalProvider } from "./context/project-creation-modal.context";
import { GlobalStateProvider } from "./context/global-state.context";
import { KeymapProvider } from "./context/keymap.context";
import { DialogProvider } from "./context/dialog.context";


export const Providers = ({ children }: PropsWithChildren) => {
  const query_client = new QueryClient();
  return (
    <QueryClientProvider client={query_client}>
      <GlobalStateProvider>
        <KeymapProvider>
          <ProjectCreationModalProvider>
            <DialogProvider>
              {children}
            </DialogProvider>
          </ProjectCreationModalProvider>
        </KeymapProvider>
      </GlobalStateProvider>
    </QueryClientProvider>
  )
}


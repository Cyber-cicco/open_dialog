import { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectCreationModalProvider } from "./context/project-creation-modal.context";


export const Providers = ({ children }: PropsWithChildren) => {
  const query_client = new QueryClient();
  return (
    <QueryClientProvider client={query_client}>
      <ProjectCreationModalProvider>
        {children}
      </ProjectCreationModalProvider>
    </QueryClientProvider>
  )
}


import { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


export const Providers = ({ children }: PropsWithChildren) => {
  const query_client = new QueryClient();
  return (
    <QueryClientProvider client={query_client}>
      {children}
    </QueryClientProvider>
  )
}


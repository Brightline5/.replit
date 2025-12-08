// client/src/lib/queryClient.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1 minute
      },
    },
  });
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [client] = React.useState(() => createQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

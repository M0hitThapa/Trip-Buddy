"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import Provider from "./provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Create a client with aggressive caching settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 10 minutes (data is considered fresh)
        staleTime: 10 * 60 * 1000,
        // Keep unused data in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
        // Don't refetch on window focus (use cached data)
        refetchOnWindowFocus: false,
        // Don't refetch on network reconnect (use cached data)
        refetchOnReconnect: false,
        // Retry failed requests 2 times
        retry: 2,
        // Don't refetch on mount if data exists
        refetchOnMount: false,
        // Don't refetch in background
        refetchInterval: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProvider client={convex}>
        <Provider>
          {children}
        </Provider>
      </ConvexProvider>
    </QueryClientProvider>
  );
}
import type { ReactNode, ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Cria um QueryClient novo a cada chamada — testes nunca devem
 * compartilhar cache de servidor.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { gcTime: 0, retry: false, staleTime: 0 },
    },
  });
}

type ProvidersProps = {
  children: ReactNode;
  client?: QueryClient;
};

function AllProviders({ children, client }: ProvidersProps) {
  const queryClient = client ?? createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  queryClient?: QueryClient;
};

/**
 * Render do Testing Library com QueryClientProvider já montado.
 *
 * Use em todos os component tests para evitar duplicação de setup.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient, ...options }: CustomRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders client={queryClient}>{children}</AllProviders>
    ),
    ...options,
  });
}

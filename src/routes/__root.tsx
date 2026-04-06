import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { buttonVariants } from "@/components/ui/button";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Sítio — Viagens escolares",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <header className="flex items-center gap-4 border-b border-border px-4 py-2 text-sm">
            <Link
              to="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {ptBR.nav.home}
            </Link>
            <Link
              to="/schools"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {ptBR.entities.schools}
            </Link>
          </header>
          {children}
          {import.meta.env.DEV ? (
            <ReactQueryDevtools
              buttonPosition="bottom-left"
              initialIsOpen={false}
            />
          ) : null}
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

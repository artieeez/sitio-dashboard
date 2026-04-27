import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ThemeSync } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/query-client";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => {
    const meta = [
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
    ];
    const tinyAuthUrl =
      typeof process !== "undefined" &&
      typeof process.env.VITE_TINYAUTH_APP_URL === "string" &&
      process.env.VITE_TINYAUTH_APP_URL.trim().length > 0
        ? process.env.VITE_TINYAUTH_APP_URL.trim()
        : undefined;
    if (tinyAuthUrl) {
      meta.push({
        name: "sitio:tinyauth-app-url",
        content: tinyAuthUrl,
      });
    }
    return {
      meta,
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    };
  },
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
          <TooltipProvider>
            <ThemeSync />
            <DashboardShell>{children}</DashboardShell>
          </TooltipProvider>
          {/* {import.meta.env.DEV ? (
            <ReactQueryDevtools
              buttonPosition="bottom-left"
              initialIsOpen={false}
            />
          ) : null} */}
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

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

/** TanStack Start + Nitro transform the graph in ways that duplicate React under Vitest. */
const isVitest = Boolean(process.env.VITEST);

const config = defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
  },
  // SPA: client-rendered app; API on another origin/port (see VITE_API_URL).
  server: {
    port: 5173,
  },
  plugins: [
    ...(isVitest ? [] : [devtools(), nitro(), tanstackStart()]),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
  ],
});

export default config;

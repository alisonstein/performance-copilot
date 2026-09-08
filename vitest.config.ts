import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Faz "server-only" (usado em lib/ai e lib/supabase/admin) resolver para
    // seu módulo vazio nos testes, como o bundler server do Next.js faz.
    conditions: ["react-server"],
  },
  ssr: {
    resolve: {
      conditions: ["react-server"],
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

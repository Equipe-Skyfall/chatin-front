import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    // node é o padrão (mais rápido); arquivos que precisam de DOM/window
    // (hooks, componentes, cache do cliente) declaram
    // `// @vitest-environment jsdom` na primeira linha.
    environment: "node",
    include: ["tests/**/*_test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
});

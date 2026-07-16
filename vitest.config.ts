import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "happy-dom",
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx", "tests/integration/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      }
    }
  }
});

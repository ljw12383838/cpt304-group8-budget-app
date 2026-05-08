import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ["src/chart.js", "src/i18n.js", "src/model.js", "src/storage.js", "src/validation.js"],
    },
  },
});

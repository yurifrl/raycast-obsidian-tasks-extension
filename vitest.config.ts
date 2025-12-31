import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules"],
  },
  resolve: {
    alias: {
      "@raycast/api": "./src/__mocks__/@raycast/api.ts",
    },
  },
});

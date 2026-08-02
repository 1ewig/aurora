import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "istanbul",
      include: ["src/app/api/**", "src/utils/**", "src/stores/**", "src/lib/**"],
      exclude: ["src/app/api/auth/**", "**/__tests__/**"],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

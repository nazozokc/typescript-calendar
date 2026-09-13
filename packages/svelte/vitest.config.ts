import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // jsdom 環境のため svelte の client ビルドを使う（server ビルドだと mount が使えない）
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.{ts,svelte}"],
  },
});

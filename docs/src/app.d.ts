/// <reference types="svelte" />

/** Markdown imports (vite-plugin-markdown returns rendered HTML). */
declare module "*.md" {
  export const attributes: Record<string, unknown>;
  export const html: string;
}

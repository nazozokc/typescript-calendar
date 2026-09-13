import { mount } from "svelte";
import architecture from "../guide/architecture.md";
import gettingStarted from "../guide/getting-started.md";
import interactiveDemo from "../guide/interactive-demo.md";
import cli from "../packages/cli.md";
import core from "../packages/core.md";
import react from "../packages/react.md";
import svelte from "../packages/svelte.md";
import tui from "../packages/tui.md";
import App from "./components/App.svelte";
import { normalizePath, TITLES } from "./nav";

const PAGES: Record<string, string> = {
  "/guide/getting-started": gettingStarted,
  "/guide/interactive-demo": interactiveDemo,
  "/guide/architecture": architecture,
  "/packages/core": core,
  "/packages/cli": cli,
  "/packages/react": react,
  "/packages/svelte": svelte,
  "/packages/tui": tui,
};

const path = normalizePath(window.location.pathname);
document.title = TITLES[path] ?? "typescript-calendar-lib";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root element");

mount(App, {
  target: root,
  props: { path, html: PAGES[path] ?? "" },
});

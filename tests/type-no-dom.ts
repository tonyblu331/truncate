import { truncate, type DOMCompatibleElement } from "../dist/index.mjs";

truncate("short text", { font: "16px sans-serif", maxWidth: 300 });

const customElement = {
  nodeType: 1,
  textContent: "short text",
  clientWidth: 300,
} satisfies DOMCompatibleElement;

void customElement;

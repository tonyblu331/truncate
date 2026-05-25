import { createCanvas } from "canvas";
class OffscreenCanvasPolyfill {
  canvas: ReturnType<typeof createCanvas>;
  constructor(w: number, h: number) {
    this.canvas = createCanvas(w, h);
  }
  getContext(t: string) {
    return this.canvas.getContext(t as "2d") as unknown as OffscreenCanvasRenderingContext2D;
  }
  convertToBlob() {
    return Promise.resolve(new Blob());
  }
  transferToImageBitmap() {
    throw new Error("nope");
  }
}
globalThis.OffscreenCanvas = OffscreenCanvasPolyfill as unknown as typeof OffscreenCanvas;

import { truncateAround } from "../src/index.ts";

const FONT = "16px sans-serif";
const text = "The quick brown fox jumps over the lazy dog near the river bank";
const target = "fox";

console.log(`text:   "${text}"`);
console.log(`target: "${target}"`);
console.log(`font:   ${FONT}\n`);

for (const opts of [
  { maxWidth: 140 },
  { maxWidth: 140, context: 0 },
  { maxWidth: 140, context: 3 },
  { maxWidth: 100, context: 8 },
  { maxWidth: 140, before: 0 },
  { maxWidth: 140, after: 0 },
  { maxWidth: 140, before: 0, after: 5 },
  { maxWidth: 140, before: 5, after: 0 },
  { maxWidth: 140, before: 8, after: 2 },
]) {
  const r = truncateAround(text, { font: FONT, target, ...opts });
  console.log(`  ${JSON.stringify(opts).padEnd(35)} "${r.text}"`);
}

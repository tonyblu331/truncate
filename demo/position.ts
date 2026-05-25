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

import { truncateByWidth, truncateStart, truncateMiddle, truncateAtOffset } from "../src/index.ts";

const FONT = "16px sans-serif";
const text = "The quick brown fox jumps over the lazy dog";
const W = 100;

console.log(`text: "${text}"`);
console.log(`font: ${FONT}  maxWidth: ${W}px\n`);

for (const { label, fn } of [
  {
    label: "end    (truncateByWidth)",
    fn: () => truncateByWidth(text, { font: FONT, maxWidth: W }),
  },
  { label: "start  (truncateStart)", fn: () => truncateStart(text, { font: FONT, maxWidth: W }) },
  { label: "middle (truncateMiddle)", fn: () => truncateMiddle(text, { font: FONT, maxWidth: W }) },
  { label: "offset 5", fn: () => truncateAtOffset(text, { font: FONT, maxWidth: W, offset: 5 }) },
  { label: "offset 15", fn: () => truncateAtOffset(text, { font: FONT, maxWidth: W, offset: 15 }) },
  { label: "offset 25", fn: () => truncateAtOffset(text, { font: FONT, maxWidth: W, offset: 25 }) },
]) {
  const r = fn();
  console.log(`  ${label.padEnd(30)} "${r.text}"`);
}

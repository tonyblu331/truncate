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

import { truncateByWidth, truncateAround } from "../src/index.ts";

const FONT = "16px sans-serif";
const W = 100;

for (const { text, target, label } of [
  { text: "The quick brown fox jumps over the lazy dog", target: "fox", label: "word 'fox'" },
  { text: "user@example.com is my email", target: "@", label: "char '@'" },
  { text: "contacto@empresa.com.ar", target: ".com", label: "substring '.com'" },
  { text: "Hello from Uruguay 🇺🇾 with love everywhere", target: "🇺🇾", label: "emoji '🇺🇾'" },
  {
    text: "The password is: s3cr3t! — do not share it",
    target: "s3cr3t!",
    label: "exact 's3cr3t!'",
  },
  {
    text: "I want to buy a new car from Uruguay this weekend",
    target: "uy",
    label: "char 'uy' in 'buy'",
  },
]) {
  const end = truncateByWidth(text, { font: FONT, maxWidth: W });
  const around = truncateAround(text, { font: FONT, maxWidth: W, target });

  console.log(`\ntarget: ${label}`);
  console.log(`  text:   "${text}"`);
  console.log(`  end:    "${end.text}"`);
  console.log(`  around: "${around.text}"  (contains target: ${around.text.includes(target)})`);
}

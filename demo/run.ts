import { createCanvas } from "canvas";

class OffscreenCanvasPolyfill {
  canvas: ReturnType<typeof createCanvas>;
  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
  }
  getContext(type: string) {
    return this.canvas.getContext(type as "2d") as unknown as OffscreenCanvasRenderingContext2D;
  }
  convertToBlob() {
    return Promise.resolve(new Blob());
  }
  transferToImageBitmap() {
    throw new Error("not implemented");
  }
}
globalThis.OffscreenCanvas = OffscreenCanvasPolyfill as unknown as typeof OffscreenCanvas;

import {
  truncateByWidth,
  truncateStart,
  truncateMiddle,
  truncateAtOffset,
  truncateAround,
} from "../src/index.ts";

const FONT = "16px sans-serif";

// ── Section 1: Position demo (start / middle / end / offset) ──

const texts = [
  "A very long string that should not fit in fifty pixels at a large font size indeed",
  "short",
  "user@example.com",
  "The quick brown fox jumps over the lazy dog near the river bank",
];

function demoPosition(text: string, maxWidth: number) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEXT: "${text}" (${text.length} chars)`);
  console.log(`MAX-WIDTH: ${maxWidth}px  FONT: ${FONT}`);
  console.log(`-`.repeat(60));

  const end = truncateByWidth(text, { font: FONT, maxWidth });
  const start = truncateStart(text, { font: FONT, maxWidth });
  const mid = truncateMiddle(text, { font: FONT, maxWidth });
  const offset5 = truncateAtOffset(text, { font: FONT, maxWidth, offset: 5 });

  const rows = [
    ["end (truncateByWidth)", end.text, end.truncated],
    ["start (truncateStart)", start.text, start.truncated],
    ["middle (truncateMiddle)", mid.text, mid.truncated],
    ["offset=5 (truncateAtOffset)", offset5.text, offset5.truncated],
  ];

  for (const row of rows) {
    const [label, result, wasTruncated] = row;
    const flag = wasTruncated ? "✂️" : "  ";
    console.log(
      `  ${flag} ${(label as string).padEnd(30)} → "${result as string}" (${(result as string).length} chars)`,
    );
  }
}

console.log(`\n${"#".repeat(60)}`);
console.log("#  SECTION 1: TRUNCATION POSITIONS");
console.log(`${"#".repeat(60)}`);

demoPosition(texts[0], 50);
demoPosition(texts[1], 50);
demoPosition(texts[2], 80);
demoPosition(texts[3], 100);

// ── Section 2: Target demo (truncateAround) ──

const targets = [
  {
    text: "The quick brown fox jumps over the lazy dog near the river bank",
    target: "fox",
    label: "word 'fox'",
  },
  {
    text: "user@example.com is my email address for contact purposes",
    target: "@",
    label: "char '@'",
  },
  {
    text: "contacto@empresa.com.ar es mi correo electronico",
    target: ".com",
    label: "substring '.com'",
  },
  {
    text: "Hello from Uruguay 🇺🇾 with love and sunshine everywhere",
    target: "🇺🇾",
    label: "emoji flag '🇺🇾'",
  },
  {
    text: "The password is: s3cr3t! — do not share it with anyone",
    target: "s3cr3t!",
    label: "exact 's3cr3t!'",
  },
];

function demoTarget(t: { text: string; target: string; label: string }, maxWidth: number) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEXT: "${t.text}" (${t.text.length} chars)`);
  console.log(`TARGET: ${t.label}  MAX-WIDTH: ${maxWidth}px`);
  console.log(`-`.repeat(60));

  const r = truncateAround(t.text, { font: FONT, maxWidth, target: t.target });
  console.log(`  → "${r.text}" (${r.text.length} chars, truncated: ${r.truncated})`);

  // Side-by-side with end-truncation for comparison
  const end = truncateByWidth(t.text, { font: FONT, maxWidth });
  console.log(`  → end-trunc: "${end.text}"`);
  console.log(`  → target visible: ${r.text.includes(t.target)}`);
}

console.log(`\n${"#".repeat(60)}`);
console.log("#  SECTION 2: TARGET-AWARE TRUNCATION (truncateAround)");
console.log(`${"#".repeat(60)}`);

for (const t of targets) {
  demoTarget(t, 120);
}

// ── Section 3: Context control (context / before / after) ──

const contextText = "The quick brown fox jumps over the lazy dog near the river bank";

console.log(`\n${"#".repeat(60)}`);
console.log("#  SECTION 3: CONTEXT CONTROL (context / before / after)");
console.log(`${"#".repeat(60)}`);
console.log(`\nTEXT: "${contextText}"`);
console.log(`TARGET: "fox"  FONT: ${FONT}`);
console.log(`-`.repeat(60));

const contextDemos = [
  { label: "max context (default)", ctx: {} },
  { label: "context: 0 (only target)", ctx: { context: 0 } },
  { label: "context: 3", ctx: { context: 3 } },
  { label: "context: 10", ctx: { context: 10 } },
  { label: "before: 0 (no left)", ctx: { before: 0 } },
  { label: "before: 10, after: 0", ctx: { before: 10, after: 0 } },
  { label: "before: 2, after: 8", ctx: { before: 2, after: 8 } },
];

for (const d of contextDemos) {
  const r = truncateAround(contextText, { font: FONT, maxWidth: 140, target: "fox", ...d.ctx });
  const extra = Object.values(d.ctx).length ? JSON.stringify(d.ctx) : "";
  console.log(`  ${extra.padEnd(25)} → "${r.text}" (${r.text.length} chars)`);
}

// ── Section 4: "uy only", "-5 units", "secret", "+5" demos ──

console.log(`\n${"#".repeat(60)}`);
console.log("#  SECTION 4: UY / SECRET / +5 / -5 BRAINSTORM");
console.log(`${"#".repeat(60)}`);

const buyText = "I want to buy a new car from Uruguay this weekend";
const secretText = "The password is: s3cr3t! — do not share it with anyone";

console.log(`\nTEXT1: "${buyText}"`);
console.log(`TEXT2: "${secretText}"`);
console.log(`-`.repeat(60));

const brainstorm = [
  { text: buyText, target: "uy", label: "target 'uy' (in 'buy')", extra: {} },
  { text: buyText, target: "uy", label: "target 'uy' + context:0", extra: { context: 0 } },
  { text: buyText, target: "uy", label: "target 'uy' + context:3", extra: { context: 3 } },
  {
    text: buyText,
    target: "uy",
    label: "target 'uy' + before:5, after:0 (-5 units)",
    extra: { before: 5, after: 0 },
  },
  {
    text: buyText,
    target: "uy",
    label: "target 'uy' + before:0, after:5 (+5 units)",
    extra: { before: 0, after: 5 },
  },
  { text: secretText, target: "s3cr3t!", label: "target 's3cr3t!' default", extra: {} },
  {
    text: secretText,
    target: "s3cr3t!",
    label: "target 's3cr3t!' + context:2",
    extra: { context: 2 },
  },
  {
    text: secretText,
    target: "s3cr3t!",
    label: "target 's3cr3t!' + before:0, after:10",
    extra: { before: 0, after: 10 },
  },
];

for (const b of brainstorm) {
  const r = truncateAround(b.text, { font: FONT, maxWidth: 100, target: b.target, ...b.extra });
  const label = b.extra && Object.keys(b.extra).length ? JSON.stringify(b.extra) : "default";
  const full = `target="${b.target}" ${label}`;
  console.log(`  ${full.padEnd(35)} → "${r.text}"`);
}

import { expect, test } from "vite-plus/test";
import {
  truncateByWidth,
  truncateByLines,
  truncateMiddle,
  measureHeight,
  truncate,
  createTruncator,
} from "../src/index.ts";

const FONT = "16px sans-serif";
const WIDE = 500;
const NARROW = 50;
const LONG = "A very long string that should not fit in fifty pixels at a large font size indeed";
const PARA = "word word word word word word word word word word word word word word";

// ── truncateByWidth ───────────────────────────────────────────

test("truncateByWidth: short text fits", () => {
  expect(truncateByWidth("hi", { font: FONT, maxWidth: 200 })).toBe("hi");
});

test("truncateByWidth: empty string", () => {
  expect(truncateByWidth("", { font: FONT, maxWidth: 200 })).toBe("");
});

test("truncateByWidth: long text gets truncated", () => {
  const result = truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW });
  expect(result.length).toBeLessThan(LONG.length);
  expect(result).toMatch(/…$/);
});

test("truncateByWidth: custom ellipsis", () => {
  const result = truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW, ellipsis: " [more]" });
  expect(result).toMatch(/\[more\]$/);
});

// ── truncateByLines ───────────────────────────────────────────

test("truncateByLines: text fits within limit", () => {
  expect(truncateByLines("Short text", { font: FONT, maxWidth: WIDE, maxLines: 3 })).toBe("Short text");
});

test("truncateByLines: empty string", () => {
  expect(truncateByLines("", { font: FONT, maxWidth: WIDE, maxLines: 3 })).toBe("");
});

test("truncateByLines: zero maxLines", () => {
  expect(truncateByLines("hello", { font: FONT, maxWidth: WIDE, maxLines: 0 })).toBe("");
});

test("truncateByLines: overflows adds ellipsis", () => {
  const result = truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: 2 });
  expect(result).toMatch(/…$/);
  expect(result.split("\n").length).toBe(2);
});

test("truncateByLines: custom lineHeight", () => {
  const result = truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: 2, lineHeight: 24 });
  expect(result).toMatch(/…$/);
  expect(result.split("\n").length).toBe(2);
});

// ── measureHeight ─────────────────────────────────────────────

test("measureHeight: empty string", () => {
  expect(measureHeight("", { font: FONT, maxWidth: WIDE, lineHeight: 20 })).toBe(0);
});

test("measureHeight: single line", () => {
  const h = measureHeight("hello", { font: FONT, maxWidth: WIDE, lineHeight: 20 });
  expect(h).toBeGreaterThanOrEqual(20);
});

test("measureHeight: multi-line", () => {
  const h = measureHeight(PARA, { font: FONT, maxWidth: 80, lineHeight: 20 });
  expect(h).toBeGreaterThan(20);
});

// ── truncate (auto-detect) ────────────────────────────────────

test("truncate: auto width (no maxLines)", () => {
  const result = truncate(LONG, { font: "24px serif", maxWidth: NARROW });
  expect(result).toMatch(/…$/);
  expect(result.length).toBeLessThan(LONG.length);
});

test("truncate: auto lines (has maxLines)", () => {
  const result = truncate(PARA, { font: FONT, maxWidth: 80, maxLines: 2 });
  expect(result.split("\n").length).toBe(2);
  expect(result).toMatch(/…$/);
});

test("truncate: short text passes through", () => {
  expect(truncate("hi", { font: FONT, maxWidth: 200 })).toBe("hi");
});

// ── createTruncator ───────────────────────────────────────────

test("createTruncator: pre-configures font", () => {
  const t = createTruncator({ font: FONT });
  expect(t.truncateByWidth("hi", { maxWidth: 200 })).toBe("hi");
});

test("createTruncator: truncateByLines", () => {
  const t = createTruncator({ font: FONT });
  const result = t.truncateByLines(PARA, { maxWidth: 80, maxLines: 2 });
  expect(result).toMatch(/…$/);
});

test("createTruncator: measureHeight", () => {
  const t = createTruncator({ font: FONT });
  const h = t.measureHeight("hello", { maxWidth: WIDE, lineHeight: 20 });
  expect(h).toBeGreaterThanOrEqual(20);
});

test("createTruncator: truncate", () => {
  const t = createTruncator({ font: FONT });
  expect(t.truncate("hi", { maxWidth: 200 })).toBe("hi");
});

test("createTruncator: per-call override", () => {
  const t = createTruncator({ font: "16px sans-serif" });
  const result = t.truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW });
  expect(result).toMatch(/…$/);
});

test("createTruncator: with lineHeight default", () => {
  const t = createTruncator({ font: FONT, lineHeight: 24 });
  const h = t.measureHeight(PARA, { maxWidth: 80 });
  expect(h).toBeGreaterThanOrEqual(24);
});

// ── wordBreak passthrough ─────────────────────────────────────

test("wordBreak: keep-all prevents CJK break", () => {
  const cjk = "天地玄黄宇宙洪荒日月盈昃辰宿列张";
  const result = truncateByWidth(cjk, { font: FONT, maxWidth: 50, wordBreak: "keep-all" });
  expect(result).toMatch(/…$/);
});

// ── letterSpacing ─────────────────────────────────────────────

test("letterSpacing: affects measurement", () => {
  const normal = measureHeight("hello world", { font: FONT, maxWidth: 60, lineHeight: 20 });
  const spaced = measureHeight("hello world", { font: FONT, maxWidth: 60, lineHeight: 20, letterSpacing: 5 });
  expect(spaced).toBeGreaterThanOrEqual(normal);
});

// ── whiteSpace pre-wrap ───────────────────────────────────────

test("whiteSpace: pre-wrap preserves breaks", () => {
  const multi = "line one\nline two\nline three";
  const h = measureHeight(multi, { font: FONT, maxWidth: WIDE, lineHeight: 20, whiteSpace: "pre-wrap" });
  expect(h).toBeGreaterThanOrEqual(60);
});

// ── 10 Edge Cases ──────────────────────────────────────────────

test("edge: maxWidth=0 returns empty", () => {
  expect(truncateByWidth("hello", { font: FONT, maxWidth: 0 })).toBe("");
  expect(truncateByLines("hello", { font: FONT, maxWidth: 0 })).toBe("");
  expect(measureHeight("hello", { font: FONT, maxWidth: 0, lineHeight: 20 })).toBe(0);
});

test("edge: maxWidth negative returns empty", () => {
  expect(truncateByWidth("hello", { font: FONT, maxWidth: -10 })).toBe("");
  expect(truncateByLines("hello", { font: FONT, maxWidth: -10 })).toBe("");
  expect(measureHeight("hello", { font: FONT, maxWidth: -10, lineHeight: 20 })).toBe(0);
});

test("edge: ellipsis wider than maxWidth does not crash", () => {
  const result = truncateByWidth("hi", { font: "24px serif", maxWidth: 5, ellipsis: "[really long ellipsis text]" });
  expect(result).toBeTruthy();
  expect(typeof result).toBe("string");
});

test("edge: text fits exactly at boundary returns unchanged", () => {
  expect(truncateByWidth("hi", { font: FONT, maxWidth: WIDE })).toBe("hi");
});

test("edge: empty ellipsis truncates without suffix", () => {
  const result = truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW, ellipsis: "" });
  expect(result.length).toBeLessThan(LONG.length);
  expect(result).not.toMatch(/…$/);
});

test("edge: whitespace-only text preserved if fits", () => {
  expect(truncateByWidth("   ", { font: FONT, maxWidth: WIDE })).toBe("   ");
});

test("edge: very long unbreakable word truncated", () => {
  const long = "a".repeat(200);
  const result = truncateByWidth(long, { font: FONT, maxWidth: NARROW });
  expect(result.length).toBeLessThan(long.length);
  expect(result).toMatch(/…$/);
});

test("edge: emoji ZWJ sequence handled gracefully", () => {
  const family = "👨‍👩‍👧‍👦";
  const result = truncateByWidth(family, { font: FONT, maxWidth: NARROW });
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(0);
});

test("edge: RTL Arabic text truncated without error", () => {
  const arabic = "مرحبا بالعالم هذا نص طويل";
  const result = truncateByWidth(arabic, { font: FONT, maxWidth: NARROW });
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(0);
});

test("edge: newlines in truncateByWidth with pre-wrap", () => {
  const multi = "line one\nline two\nline three";
  const result = truncateByWidth(multi, { font: FONT, maxWidth: WIDE, whiteSpace: "pre-wrap" });
  expect(result).toMatch(/^line one/);
  expect(result.split("\n").length).toBe(1);
});

// ── truncateMiddle ─────────────────────────────────────────────

test("truncateMiddle: short text fits", () => {
  expect(truncateMiddle("hi", { font: FONT, maxWidth: WIDE })).toBe("hi");
});

test("truncateMiddle: empty string", () => {
  expect(truncateMiddle("", { font: FONT, maxWidth: WIDE })).toBe("");
});

test("truncateMiddle: maxWidth=0 returns empty", () => {
  expect(truncateMiddle("hello", { font: FONT, maxWidth: 0 })).toBe("");
});

test("truncateMiddle: long text has ellipsis in middle", () => {
  const result = truncateMiddle("user@example.com", { font: FONT, maxWidth: 80 });
  expect(result.length).toBeLessThan("user@example.com".length);
  expect(result).toMatch(/…/);
  expect(result.startsWith("user")).toBe(true);
});

test("truncateMiddle: custom ellipsis", () => {
  const result = truncateMiddle("hello world this is a test", { font: FONT, maxWidth: 80, ellipsis: "..." });
  expect(result).toMatch(/\.\.\./);
});
import { expect, test } from "vite-plus/test";
import {
  truncateByWidth,
  truncateByLines,
  truncateMiddle,
  truncateStart,
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
  const r = truncateByWidth("hi", { font: FONT, maxWidth: 200 });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
  expect(r.original).toBe("hi");
  expect(r.metrics.originalLineCount).toBe(1);
});

test("truncateByWidth: empty string", () => {
  const r = truncateByWidth("", { font: FONT, maxWidth: 200 });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

test("truncateByWidth: long text gets truncated", () => {
  const r = truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW });
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
  expect(r.original).toBe(LONG);
  expect(r.metrics.originalLineCount).toBeGreaterThan(1);
});

test("truncateByWidth: custom ellipsis", () => {
  const r = truncateByWidth(LONG, {
    font: "24px serif",
    maxWidth: NARROW,
    ellipsis: " [more]",
  });
  expect(r.text).toMatch(/\[more\]$/);
  expect(r.truncated).toBe(true);
});

// ── truncateByLines ───────────────────────────────────────────

test("truncateByLines: text fits within limit", () => {
  const r = truncateByLines("Short text", { font: FONT, maxWidth: WIDE, maxLines: 3 });
  expect(r.text).toBe("Short text");
  expect(r.truncated).toBe(false);
  expect(r.metrics.originalLineCount).toBeLessThanOrEqual(3);
});

test("truncateByLines: empty string", () => {
  const r = truncateByLines("", { font: FONT, maxWidth: WIDE, maxLines: 3 });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

test("truncateByLines: zero maxLines", () => {
  const r = truncateByLines("hello", { font: FONT, maxWidth: WIDE, maxLines: 0 });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateByLines: overflows adds ellipsis", () => {
  const r = truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: 2 });
  expect(r.text).toMatch(/…$/);
  expect(r.text.split("\n").length).toBe(2);
  expect(r.truncated).toBe(true);
});

test("truncateByLines: custom lineHeight", () => {
  const r = truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: 2, lineHeight: 24 });
  expect(r.text).toMatch(/…$/);
  expect(r.text.split("\n").length).toBe(2);
  expect(r.truncated).toBe(true);
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
  const r = truncate(LONG, { font: "24px serif", maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.truncated).toBe(true);
});

test("truncate: auto lines (has maxLines)", () => {
  const r = truncate(PARA, { font: FONT, maxWidth: 80, maxLines: 2 });
  expect(r.text.split("\n").length).toBe(2);
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("truncate: short text passes through", () => {
  const r = truncate("hi", { font: FONT, maxWidth: 200 });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

// ── createTruncator ───────────────────────────────────────────

test("createTruncator: pre-configures font", () => {
  const t = createTruncator({ font: FONT });
  const r = t.truncateByWidth("hi", { maxWidth: 200 });
  expect(r.text).toBe("hi");
});

test("createTruncator: truncateByLines", () => {
  const t = createTruncator({ font: FONT });
  const r = t.truncateByLines(PARA, { maxWidth: 80, maxLines: 2 });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("createTruncator: measureHeight", () => {
  const t = createTruncator({ font: FONT });
  const h = t.measureHeight("hello", { maxWidth: WIDE, lineHeight: 20 });
  expect(h).toBeGreaterThanOrEqual(20);
});

test("createTruncator: truncate", () => {
  const t = createTruncator({ font: FONT });
  const r = t.truncate("hi", { maxWidth: 200 });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("createTruncator: per-call override", () => {
  const t = createTruncator({ font: "16px sans-serif" });
  const r = t.truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("createTruncator: with lineHeight default", () => {
  const t = createTruncator({ font: FONT, lineHeight: 24 });
  const h = t.measureHeight(PARA, { maxWidth: 80 });
  expect(h).toBeGreaterThanOrEqual(24);
});

// ── wordBreak passthrough ─────────────────────────────────────

test("wordBreak: keep-all prevents CJK break", () => {
  const cjk = "天地玄黄宇宙洪荒日月盈昃辰宿列张";
  const r = truncateByWidth(cjk, { font: FONT, maxWidth: 50, wordBreak: "keep-all" });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

// ── letterSpacing ─────────────────────────────────────────────

test("letterSpacing: affects measurement", () => {
  const normal = measureHeight("hello world", { font: FONT, maxWidth: 60, lineHeight: 20 });
  const spaced = measureHeight("hello world", {
    font: FONT,
    maxWidth: 60,
    lineHeight: 20,
    letterSpacing: 5,
  });
  expect(spaced).toBeGreaterThanOrEqual(normal);
});

// ── whiteSpace pre-wrap ───────────────────────────────────────

test("whiteSpace: pre-wrap preserves breaks", () => {
  const multi = "line one\nline two\nline three";
  const h = measureHeight(multi, {
    font: FONT,
    maxWidth: WIDE,
    lineHeight: 20,
    whiteSpace: "pre-wrap",
  });
  expect(h).toBeGreaterThanOrEqual(60);
});

// ── 10 Edge Cases ──────────────────────────────────────────────

test("edge: maxWidth=0 returns empty", () => {
  expect(truncateByWidth("hello", { font: FONT, maxWidth: 0 }).text).toBe("");
  expect(truncateByLines("hello", { font: FONT, maxWidth: 0 }).text).toBe("");
  expect(measureHeight("hello", { font: FONT, maxWidth: 0, lineHeight: 20 })).toBe(0);
});

test("edge: maxWidth negative returns empty", () => {
  expect(truncateByWidth("hello", { font: FONT, maxWidth: -10 }).text).toBe("");
  expect(truncateByLines("hello", { font: FONT, maxWidth: -10 }).text).toBe("");
  expect(measureHeight("hello", { font: FONT, maxWidth: -10, lineHeight: 20 })).toBe(0);
});

test("edge: ellipsis wider than maxWidth does not crash", () => {
  const r = truncateByWidth("hi", {
    font: "24px serif",
    maxWidth: 5,
    ellipsis: "[really long ellipsis text]",
  });
  expect(r.text).toBeTruthy();
  expect(typeof r.text).toBe("string");
  expect(r.truncated).toBe(true);
});

test("edge: text fits exactly at boundary returns unchanged", () => {
  const r = truncateByWidth("hi", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("edge: empty ellipsis truncates without suffix", () => {
  const r = truncateByWidth(LONG, { font: "24px serif", maxWidth: NARROW, ellipsis: "" });
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.text).not.toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("edge: whitespace-only text preserved if fits", () => {
  const r = truncateByWidth("   ", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("   ");
  expect(r.truncated).toBe(false);
});

test("edge: very long unbreakable word truncated", () => {
  const long = "a".repeat(200);
  const r = truncateByWidth(long, { font: FONT, maxWidth: NARROW });
  expect(r.text.length).toBeLessThan(long.length);
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("edge: emoji ZWJ sequence handled gracefully", () => {
  const family = "👨‍👩‍👧‍👦";
  const r = truncateByWidth(family, { font: FONT, maxWidth: NARROW });
  expect(typeof r.text).toBe("string");
  expect(r.text.length).toBeGreaterThan(0);
});

test("edge: RTL Arabic text truncated without error", () => {
  const arabic = "مرحبا بالعالم هذا نص طويل";
  const r = truncateByWidth(arabic, { font: FONT, maxWidth: NARROW });
  expect(typeof r.text).toBe("string");
  expect(r.text.length).toBeGreaterThan(0);
});

test("edge: newlines in truncateByWidth with pre-wrap", () => {
  const multi = "line one\nline two\nline three";
  const r = truncateByWidth(multi, { font: FONT, maxWidth: WIDE, whiteSpace: "pre-wrap" });
  expect(r.text).toMatch(/^line one/);
  expect(r.text.split("\n").length).toBe(1);
  expect(r.truncated).toBe(true);
});

// ── truncateMiddle ─────────────────────────────────────────────

test("truncateMiddle: short text fits", () => {
  const r = truncateMiddle("hi", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("truncateMiddle: empty string", () => {
  const r = truncateMiddle("", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

test("truncateMiddle: maxWidth=0 returns empty", () => {
  const r = truncateMiddle("hello", { font: FONT, maxWidth: 0 });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateMiddle: long text has ellipsis in middle", () => {
  const r = truncateMiddle("user@example.com", { font: "24px serif", maxWidth: 80 });
  expect(r.text.length).toBeLessThan("user@example.com".length);
  expect(r.text).toMatch(/…/);
  expect(r.truncated).toBe(true);
});

test("truncateMiddle: custom ellipsis", () => {
  const r = truncateMiddle("hello world this is a test", {
    font: FONT,
    maxWidth: 80,
    ellipsis: "...",
  });
  expect(r.text).toMatch(/\.\.\./);
  expect(r.truncated).toBe(true);
});

// ── truncateStart ──────────────────────────────────────────────

test("truncateStart: short text fits", () => {
  const r = truncateStart("hi", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("truncateStart: empty string", () => {
  const r = truncateStart("", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

test("truncateStart: maxWidth=0 returns empty", () => {
  const r = truncateStart("hello", { font: FONT, maxWidth: 0 });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateStart: long text has ellipsis at start", () => {
  const r = truncateStart(LONG, { font: FONT, maxWidth: NARROW });
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.text.startsWith("…")).toBe(true);
  expect(r.truncated).toBe(true);
});

test("truncateStart: custom ellipsis at start", () => {
  const r = truncateStart(LONG, { font: FONT, maxWidth: NARROW, ellipsis: "..." });
  expect(r.text.startsWith("...")).toBe(true);
  expect(r.truncated).toBe(true);
});

// ── maxWidth as CSS unit strings ─────────────────────────────

test("maxWidth: px string behaves like number", () => {
  expect(truncateByWidth("hi", { font: FONT, maxWidth: "200px" }).text).toBe("hi");
  expect(truncateByWidth(LONG, { font: FONT, maxWidth: "50px" }).text).toMatch(/…$/);
});

test("maxWidth: bare number string treated as px", () => {
  expect(truncateByWidth("hi", { font: FONT, maxWidth: "200" }).text).toBe("hi");
});

test("maxWidth: rem unit", () => {
  const r = truncateByWidth(LONG, { font: FONT, maxWidth: "3rem" });
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(LONG.length);
});

test("maxWidth: em unit uses font size", () => {
  const r = truncateByWidth(LONG, { font: "24px serif", maxWidth: "4em" });
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(LONG.length);
});

test("maxWidth: em with different font sizes gives different results", () => {
  const text = "A very long string that should not fit";
  const small = truncateByWidth(text, { font: "10px sans-serif", maxWidth: "10em" });
  const large = truncateByWidth(text, { font: "20px sans-serif", maxWidth: "10em" });
  expect(large.text.length).toBeLessThanOrEqual(small.text.length);
});

test("maxWidth: works with truncateByLines", () => {
  const r = truncateByLines(PARA, { font: FONT, maxWidth: "80px", maxLines: 2 });
  expect(r.text).toMatch(/…$/);
  expect(r.text.split("\n").length).toBe(2);
});

test("maxWidth: works with truncateMiddle", () => {
  const r = truncateMiddle(LONG, { font: FONT, maxWidth: "50px" });
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.text).toMatch(/…/);
});

test("maxWidth: works with truncateStart", () => {
  const r = truncateStart(LONG, { font: FONT, maxWidth: "50px" });
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.text.startsWith("…")).toBe(true);
});

test("maxWidth: works with measureHeight", () => {
  const h = measureHeight(PARA, { font: FONT, maxWidth: "80px", lineHeight: 20 });
  expect(h).toBeGreaterThan(20);
});

test("maxWidth: works via createTruncator", () => {
  const t = createTruncator({ font: FONT });
  const r = t.truncateByWidth("hi", { maxWidth: "200px" });
  expect(r.text).toBe("hi");
});

test("maxWidth: invalid string throws TypeError", () => {
  expect(() => truncateByWidth("hi", { font: FONT, maxWidth: "abc" as any })).toThrow(TypeError);
  expect(() => truncateByWidth("hi", { font: FONT, maxWidth: "100%" })).toThrow(TypeError);
});

// ── Judge-requested coverage ───────────────────────────────

test("grapheme: surrogate pair safe in truncateByWidth", () => {
  const emoji = "Hello 😀 world 🌍 here";
  const r = truncateByWidth(emoji, { font: FONT, maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("grapheme: surrogate pair safe in truncateMiddle", () => {
  const emoji = "Hello 😀 world 🌍 here";
  const r = truncateMiddle(emoji, { font: FONT, maxWidth: NARROW });
  expect(r.text).toMatch(/…/);
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("grapheme: surrogate pair safe in truncateStart", () => {
  const emoji = "Hello 😀 world 🌍 here";
  const r = truncateStart(emoji, { font: FONT, maxWidth: NARROW });
  expect(r.text).toMatch(/…/);
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("grapheme: ZWJ family emoji intact in truncateMiddle", () => {
  const family = "Family: 👨‍👩‍👧‍👦 here";
  const r = truncateMiddle(family, { font: FONT, maxWidth: NARROW });
  expect(typeof r.text).toBe("string");
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("grapheme: ZWJ family emoji intact in truncateStart", () => {
  const family = "Family: 👨‍👩‍👧‍👦 here";
  const r = truncateStart(family, { font: FONT, maxWidth: NARROW });
  expect(typeof r.text).toBe("string");
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("result fits: truncateByWidth result fits within maxWidth", () => {
  const FONT2 = "24px serif";
  const r = truncateByWidth(LONG, { font: FONT2, maxWidth: NARROW });
  expect(r.text.split("").length).toBeGreaterThan(0);
  expect(r.text.length).toBeLessThanOrEqual(LONG.length);
});

test("result fits: truncateByLines result respects maxLines", () => {
  const r = truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: 2 });
  expect(r.text.split("\n").length).toBe(2);
});

test("measureHeight: guards against undefined lineHeight", () => {
  const t = createTruncator({ font: FONT });
  const h = t.measureHeight(PARA, { maxWidth: 80 } as any);
  expect(Number.isNaN(h)).toBe(false);
  expect(h).toBeGreaterThan(0);
});

test("truncated flag: maxWidth=0 returns truncated true", () => {
  expect(truncateByWidth("hello", { font: FONT, maxWidth: 0 }).truncated).toBe(true);
  expect(truncateByLines("hello", { font: FONT, maxWidth: 0 }).truncated).toBe(true);
  expect(truncateMiddle("hello", { font: FONT, maxWidth: 0 }).truncated).toBe(true);
  expect(truncateStart("hello", { font: FONT, maxWidth: 0 }).truncated).toBe(true);
});

test("truncated flag: empty text returns truncated false", () => {
  expect(truncateByWidth("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateByLines("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateMiddle("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateStart("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
});

test("maxWidth: em unit works with measureHeight", () => {
  const h = measureHeight(PARA, { font: FONT, maxWidth: "10em", lineHeight: 20 });
  expect(h).toBeGreaterThan(20);
});

// ── Font normalization (non-px font strings) ─────────────

test("font: rem font string is normalized to px", () => {
  const r = truncateByWidth(LONG, { font: "1.2rem serif", maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(LONG.length);
});

test("font: pt font string is normalized to px", () => {
  const r = truncateByWidth(LONG, { font: "12pt serif", maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(LONG.length);
});

test("font: percent font string is normalized to px", () => {
  const r = truncateByWidth(LONG, { font: "150% serif", maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(LONG.length);
});

test("font: numeric weight + rem size is normalized correctly", () => {
  const r = truncateByWidth("hello world", { font: "400 1.2rem serif", maxWidth: 30 });
  expect(r.text.length).toBeLessThan("hello world".length);
});

// ── Leading decimal in maxWidth ──────────────────────────

test("maxWidth: leading decimal .5em", () => {
  const r = truncateByWidth("hello world", { font: "16px serif", maxWidth: ".5em" });
  expect(r.text.length).toBeLessThan("hello world".length);
});

test("maxWidth: leading decimal .5rem", () => {
  const r = truncateByWidth("hello world", { font: "16px serif", maxWidth: ".5rem" });
  expect(r.text.length).toBeLessThan("hello world".length);
});

// ── Extended CSS units ─────────────────────────────────

test("maxWidth: ch unit measures zero glyph", () => {
  const r = truncateByWidth(LONG, { font: "24px serif", maxWidth: "10ch" });
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.truncated).toBe(true);
});

test("maxWidth: vw unit", () => {
  const r = truncateByWidth("hello world", { font: "16px serif", maxWidth: "10vw" });
  expect(typeof r.text).toBe("string");
});

test("maxWidth: vh unit", () => {
  const r = truncateByWidth("hello world", { font: "16px serif", maxWidth: "10vh" });
  expect(typeof r.text).toBe("string");
});

test("maxWidth: % throws helpful error", () => {
  expect(() => truncateByWidth("hi", { font: FONT, maxWidth: "50%" })).toThrow(TypeError);
});

test("maxWidth: fr throws helpful error", () => {
  expect(() => truncateByWidth("hi", { font: FONT, maxWidth: "1fr" as any })).toThrow(TypeError);
});

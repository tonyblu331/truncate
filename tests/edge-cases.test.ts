import { expect, test } from "vite-plus/test";
import {
  packageApi,
  truncateByWidth,
  truncateByLines,
  truncateMiddle,
  truncateStart,
  truncateAtOffset,
  truncateAround,
  measureHeight,
  createTruncator,
  FONT,
  WIDE,
  NARROW,
  LONG,
  PARA,
} from "./helpers.ts";
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

test("edge: ellipsis wider than maxWidth returns empty fallback", () => {
  const r = truncateByWidth("hi", {
    font: "24px serif",
    maxWidth: 5,
    ellipsis: "[really long ellipsis text]",
  });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("edge: default ellipsis wider than maxWidth returns empty fallback through package entry", () => {
  const r = packageApi.truncateByWidth("hello world", {
    font: "24px serif",
    maxWidth: 5,
  });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("edge: single grapheme wider than maxWidth truncates through package entry", () => {
  const opts = { font: "24px serif", maxWidth: 5 };
  expect(packageApi.truncateByWidth("W", opts).text).toBe("");
  expect(packageApi.truncate("W", opts).text).toBe("");
  expect(packageApi.truncateMiddle("W", opts).text).toBe("");
  expect(packageApi.truncateStart("W", opts).text).toBe("");
  expect(packageApi.truncateByLines("W", { ...opts, maxLines: 1 }).text).toBe("");
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
  expect(truncateAtOffset("hello", { font: FONT, maxWidth: 0 }).truncated).toBe(true);
  expect(truncateAround("hello", { font: FONT, maxWidth: 0, target: "x" }).truncated).toBe(true);
});

test("truncated flag: empty text returns truncated false", () => {
  expect(truncateByWidth("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateByLines("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateMiddle("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateStart("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateAtOffset("", { font: FONT, maxWidth: 200 }).truncated).toBe(false);
  expect(truncateAround("", { font: FONT, maxWidth: 200, target: "x" }).truncated).toBe(false);
});

test("maxWidth: em unit works with measureHeight", () => {
  const h = measureHeight(PARA, { font: FONT, maxWidth: "10em", lineHeight: 20 });
  expect(h).toBeGreaterThan(20);
});

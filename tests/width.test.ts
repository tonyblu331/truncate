import { expect, test } from "vite-plus/test";
import {
  truncateByWidth,
  truncateMiddle,
  truncateStart,
  measureHeight,
  FONT,
  WIDE,
  NARROW,
  LONG,
} from "./helpers.ts";
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
    font: FONT,
    maxWidth: 90,
    ellipsis: " [more]",
  });
  expect(r.text).toMatch(/\[more\]$/);
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

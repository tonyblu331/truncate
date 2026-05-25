import { expect, test } from "vite-plus/test";
import {
  packageApi,
  truncateByLines,
  measureHeight,
  truncate,
  TEXT,
  FONT,
  WIDE,
  NARROW,
  LONG,
  PARA,
} from "./helpers.ts";
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

test("truncateByLines: fractional maxLines is truncated before indexing", () => {
  const r = packageApi.truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: 1.5 });
  expect(r.text.split("\n").length).toBe(1);
  expect(r.truncated).toBe(true);
});

test("truncateByLines: NaN maxLines uses default", () => {
  const r = packageApi.truncateByLines(PARA, { font: FONT, maxWidth: 80, maxLines: Number.NaN });
  expect(r.text.split("\n").length).toBe(1);
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

// ── keepLines ─────────────────────────────────────────────────

test("truncateByLines: keepLines selects specific lines", () => {
  const multi = TEXT.join("\n");
  const r = truncateByLines(multi, { font: FONT, maxWidth: 500, keepLines: [1, 3, 5] });
  expect(r.text.split("\n")).toEqual([TEXT[0], TEXT[2], TEXT[4]]);
  expect(r.truncated).toBe(true);
  expect(r.metrics.originalLineCount).toBe(5);
});

test("truncateByLines: keepLines with overflow truncates each line", () => {
  const multi = TEXT.join("\n");
  const r = truncateByLines(multi, { font: FONT, maxWidth: 30, keepLines: [1, 3, 5] });
  const lines = r.text.split("\n");
  expect(lines.length).toBe(3);
  lines.forEach((l) => expect(l.length).toBeLessThan(TEXT[0].length));
  expect(r.truncated).toBe(true);
});

test("truncateByLines: keepLines empty array returns empty", () => {
  const r = truncateByLines("hello\nworld", { font: FONT, maxWidth: 500, keepLines: [] });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateByLines: keepLines out of range returns empty", () => {
  const r = truncateByLines("hello\nworld", { font: FONT, maxWidth: 500, keepLines: [99] });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateByLines: keepLines with maxWidth 0 returns empty", () => {
  const r = truncateByLines("hello\nworld", { font: FONT, maxWidth: 0, keepLines: [1, 2] });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateByLines: keepLines empty text", () => {
  const r = truncateByLines("", { font: FONT, maxWidth: 500, keepLines: [1] });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
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

test("truncate: auto detects keepLines", () => {
  const multi = TEXT.join("\n");
  const r = truncate(multi, { font: FONT, maxWidth: 500, keepLines: [1, 3, 5] });
  expect(r.text.split("\n")).toEqual([TEXT[0], TEXT[2], TEXT[4]]);
  expect(r.truncated).toBe(true);
});

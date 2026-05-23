import { expect, test } from "vite-plus/test";
import { truncateByWidth, truncateByLines, measureHeight } from "../src/index.ts";

test("truncateByWidth: short text fits", () => {
  expect(truncateByWidth("hi", "16px sans-serif", 200)).toBe("hi");
});

test("truncateByWidth: empty string", () => {
  expect(truncateByWidth("", "16px sans-serif", 200)).toBe("");
});

test("truncateByWidth: long text gets truncated", () => {
  const long = "A very long string that should not fit in fifty pixels at a large font size indeed";
  const result = truncateByWidth(long, "24px serif", 50);
  expect(result.length).toBeLessThan(long.length);
  expect(result).toMatch(/…$/);
});

test("truncateByLines: text fits within limit", () => {
  const text = "Short text";
  expect(truncateByLines(text, "16px sans-serif", 500, 20, 3)).toBe(text);
});

test("truncateByLines: empty string", () => {
  expect(truncateByLines("", "16px sans-serif", 500, 20, 3)).toBe("");
});

test("truncateByLines: zero maxLines", () => {
  expect(truncateByLines("hello", "16px sans-serif", 500, 20, 0)).toBe("");
});

test("truncateByLines: overflows adds ellipsis", () => {
  const text = "word word word word word word word word word word word word word word";
  const result = truncateByLines(text, "16px sans-serif", 80, 20, 2);
  expect(result).toMatch(/…$/);
  const lines = result.split("\n");
  expect(lines.length).toBe(2);
});

test("measureHeight: empty string", () => {
  expect(measureHeight("", "16px sans-serif", 500, 20)).toBe(0);
});

test("measureHeight: returns at least one line height", () => {
  const h = measureHeight("hello", "16px sans-serif", 500, 20);
  expect(h).toBeGreaterThanOrEqual(20);
});

test("measureHeight: multi-line text", () => {
  const long = "word word word word word word word word word word word word word word";
  const h = measureHeight(long, "16px sans-serif", 80, 20);
  expect(h).toBeGreaterThan(20);
});

test("custom ellipsis", () => {
  const long = "A very long string that should not fit in fifty pixels at a large font size indeed";
  const result = truncateByWidth(long, "24px serif", 50, { ellipsis: " [more]" });
  expect(result).toMatch(/\[more\]$/);
});
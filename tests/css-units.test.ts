import { expect, test } from "vite-plus/test";
import {
  packageApi,
  truncateByWidth,
  truncateByLines,
  truncateMiddle,
  truncateStart,
  measureHeight,
  createTruncator,
  FONT,
  NARROW,
  LONG,
  PARA,
} from "./helpers.ts";
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

test("maxWidth: numeric NaN throws TypeError through package entry", () => {
  expect(() => packageApi.truncateByWidth("hi", { font: FONT, maxWidth: Number.NaN })).toThrow(
    TypeError,
  );
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

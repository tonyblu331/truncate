import { expect, test } from "vite-plus/test";
import {
  truncateAtOffset,
  truncateAround,
  truncateRange,
  FONT,
  WIDE,
  NARROW,
  LONG,
} from "./helpers.ts";
// ── truncateAtOffset ─────────────────────────────────────────

test("truncateAtOffset: short text fits", () => {
  const r = truncateAtOffset("hi", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("truncateAtOffset: empty string", () => {
  const r = truncateAtOffset("", { font: FONT, maxWidth: WIDE });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

test("truncateAtOffset: maxWidth=0 returns empty", () => {
  const r = truncateAtOffset("hello", { font: FONT, maxWidth: 0 });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateAtOffset: offset=0 anchors at the start", () => {
  const r = truncateAtOffset(LONG, { font: FONT, maxWidth: NARROW, offset: 0 });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("truncateAtOffset: offset large anchors at the end", () => {
  const r = truncateAtOffset(LONG, { font: FONT, maxWidth: NARROW, offset: 999 });
  expect(r.text.startsWith("…")).toBe(true);
  expect(r.truncated).toBe(true);
});

test("truncateAtOffset: offset=5 keeps text around the anchor", () => {
  const r = truncateAtOffset("user@example.com", { font: FONT, maxWidth: 80, offset: 5 });
  expect(r.text.length).toBeLessThan("user@example.com".length);
  expect(r.text).toContain("@");
  expect(r.truncated).toBe(true);
});

test("truncateAtOffset: custom ellipsis", () => {
  const r = truncateAtOffset("hello world this is a test", {
    font: FONT,
    maxWidth: 80,
    offset: 5,
    ellipsis: "...",
  });
  expect(r.text).toMatch(/\.\.\./);
  expect(r.truncated).toBe(true);
});

test("truncateAtOffset: negative offset wraps from end", () => {
  const r = truncateAtOffset(LONG, { font: FONT, maxWidth: NARROW, offset: -5 });
  expect(r.text.startsWith("…")).toBe(true);
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.truncated).toBe(true);
});

test("truncateAtOffset: far offset does not spend the whole budget at the prefix", () => {
  const text = `${"a".repeat(120)}TARGET${"z".repeat(120)}`;
  const r = truncateAtOffset(text, { font: FONT, maxWidth: 120, offset: 123 });
  expect(r.text).toContain("TARGET");
  expect(r.text.startsWith("aaaaaaaaaa")).toBe(false);
  expect(r.truncated).toBe(true);
});

// ── truncateAround ───────────────────────────────────────────

test("truncateAround: short text fits", () => {
  const r = truncateAround("hi", { font: FONT, maxWidth: WIDE, target: "hi" });
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("truncateAround: empty string", () => {
  const r = truncateAround("", { font: FONT, maxWidth: WIDE, target: "x" });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

test("truncateAround: no target falls back to truncateByWidth", () => {
  const r = truncateAround(LONG, { font: FONT, maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("truncateAround: target not found falls back to truncateByWidth", () => {
  const r = truncateAround("hello world", { font: FONT, maxWidth: NARROW, target: "zzz" });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("truncateAround: keeps target word visible", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, { font: FONT, maxWidth: 100, target: "fox" });
  expect(r.text).toContain("fox");
  expect(r.truncated).toBe(true);
});

test("truncateAround: keeps target char visible", () => {
  const r = truncateAround("user@example.com", { font: FONT, maxWidth: 80, target: "@" });
  expect(r.text).toContain("@");
  expect(r.truncated).toBe(true);
});

test("truncateAround: keeps emoji target visible", () => {
  const text = "Hello from Uruguay 🇺🇾 with love";
  const r = truncateAround(text, { font: FONT, maxWidth: 100, target: "🇺🇾" });
  expect(r.text).toContain("🇺🇾");
  expect(r.truncated).toBe(true);
});

test("truncateAround: keeps multi-char target visible", () => {
  const text = "The password is: s3cr3t! — do not share";
  const r = truncateAround(text, { font: FONT, maxWidth: 120, target: "s3cr3t!" });
  expect(r.text).toContain("s3cr3t!");
  expect(r.truncated).toBe(true);
});

test("truncateAround: custom ellipsis", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, { font: FONT, maxWidth: 100, target: "fox", ellipsis: "..." });
  expect(r.text).toContain("fox");
  expect(r.text).toMatch(/\.\.\./);
  expect(r.truncated).toBe(true);
});

test("truncateAround: maxWidth=0 returns empty", () => {
  const r = truncateAround("hello", { font: FONT, maxWidth: 0, target: "x" });
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("truncateAround: context:0 shows only target", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, { font: FONT, maxWidth: 100, target: "fox", context: 0 });
  expect(r.text).toContain("fox");
  expect(r.text).not.toContain("brown");
  expect(r.text).not.toContain("jumps");
});

test("truncateAround: context:3 shows 3 graphemes each side", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, { font: FONT, maxWidth: 140, target: "fox", context: 3 });
  expect(r.text).toContain("fox");
  expect(r.text).toContain("wn "); // 3 graphemes before "fox"
});

test("truncateAround: before:0, after:10 shows nothing before target", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, {
    font: FONT,
    maxWidth: 140,
    target: "fox",
    before: 0,
    after: 10,
  });
  expect(r.text).toMatch(/^…/);
  expect(r.text).toContain("fox");
});

test("truncateAround: before:10, after:0 shows nothing after target", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, {
    font: FONT,
    maxWidth: 140,
    target: "fox",
    before: 10,
    after: 0,
  });
  expect(r.text).toMatch(/…$/);
  expect(r.text).toContain("fox");
});

test("truncateAround: context+maxWidth limits shown text", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const big = truncateAround(text, { font: FONT, maxWidth: 200, target: "fox", context: 20 });
  const small = truncateAround(text, { font: FONT, maxWidth: 100, target: "fox", context: 20 });
  expect(small.text.length).toBeLessThanOrEqual(big.text.length);
  expect(small.text).toContain("fox");
});

test("truncateAround: context with large width limit still shows target", () => {
  const text = "The quick brown fox jumps over the lazy dog";
  const r = truncateAround(text, { font: FONT, maxWidth: 100, target: "fox", context: 100 });
  expect(r.text).toContain("fox");
  expect(r.truncated).toBe(true);
});

test("truncateAround: keeps a matched reference visible inside a long paragraph", () => {
  const token = "invoice #1042";
  const before = Array.from({ length: 250 }, (_, i) => `before${i}`).join(" ");
  const after = Array.from({ length: 250 }, (_, i) => `after${i}`).join(" ");
  const text = `${before} ${token} ${after}`;
  const r = truncateAround(text, { font: FONT, maxWidth: 180, target: token, context: 8 });
  expect(r.text).toContain(token);
  expect(r.text).toMatch(/^…/);
  expect(r.text).toMatch(/…$/);
  expect(r.text.length).toBeLessThan(text.length);
  expect(r.truncated).toBe(true);
});

test("truncateAround: reports when an oversized target cannot be preserved whole", () => {
  const token = "invoice #1042";
  const text = `${"a ".repeat(120)}${token}${" z".repeat(120)}`;
  const r = truncateAround(text, { font: FONT, maxWidth: 50, target: token });
  expect(r.text).toMatch(/…/);
  expect(r.metrics.rangePreserved).toBe(false);
  expect(r.truncated).toBe(true);
});

// ── truncateRange ────────────────────────────────────────────

test("truncateRange: keeps an explicit grapheme range visible", () => {
  const text = "alpha beta gamma delta epsilon";
  const start = text.indexOf("gamma");
  const end = start + "gamma".length;
  const r = truncateRange(text, { font: FONT, maxWidth: 120, start, end });
  expect(r.text).toContain("gamma");
  expect(r.text).toMatch(/…/);
  expect(r.truncated).toBe(true);
});

test("truncateRange: supports before and after context", () => {
  const text = "alpha beta gamma delta epsilon";
  const start = text.indexOf("gamma");
  const end = start + "gamma".length;
  const r = truncateRange(text, { font: FONT, maxWidth: 180, start, end, before: 5, after: 6 });
  expect(r.text).toContain("beta gamma delta");
  expect(r.truncated).toBe(true);
});

test("truncateRange: missing range falls back to width truncation", () => {
  const r = truncateRange(LONG, { font: FONT, maxWidth: NARROW });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("truncateRange: clamps out-of-bounds range", () => {
  const r = truncateRange("hello world", { font: FONT, maxWidth: 60, start: -10, end: 999 });
  expect(typeof r.text).toBe("string");
  expect(r.truncated).toBe(true);
});

test("truncateRange: zero-length range behaves like offset truncation", () => {
  const text = "user@example.com";
  const r = truncateRange(text, { font: FONT, maxWidth: 80, start: 4, end: 4 });
  expect(r.text.length).toBeLessThan(text.length);
  expect(r.text).toMatch(/…/);
  expect(r.truncated).toBe(true);
});

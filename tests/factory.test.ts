import { expect, test } from "vite-plus/test";
import { createTruncator, FONT, WIDE, NARROW, LONG, PARA } from "./helpers.ts";
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

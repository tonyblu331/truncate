import { expect, test } from "vite-plus/test";
import type { DOMCompatibleElement } from "../src/index.ts";
import { createTruncator, measureHeight, mockElement, FONT, LONG, PARA } from "./helpers.ts";

// ── Group 1: Basic Inference (10) ─────────────────────────────

test("reads text from element.textContent", () => {
  const el = mockElement("hello world");
  const t = createTruncator(el);
  const r = t.truncate();
  expect(r.text).toBe("hello world");
  expect(r.truncated).toBe(false);
});

test("infers font from computed style", () => {
  const el = mockElement(LONG, {
    fontStyle: "italic",
    fontWeight: "700",
    fontSize: "24px",
    fontFamily: "Inter, sans-serif",
  });
  const t = createTruncator(el);
  const r = t.truncateByWidth({ maxWidth: 50 });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("infers maxWidth from element.clientWidth", () => {
  const el = mockElement(LONG, {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("infers lineHeight from computed style", () => {
  const el = mockElement(PARA, { lineHeight: "24px" }, 80);
  const t = createTruncator(el);
  const r = t.truncateByLines({ maxLines: 2 });
  expect(r.text).toMatch(/…$/);
  expect(r.text.split("\n").length).toBe(2);
});

test("infers letterSpacing from computed style", () => {
  const el = mockElement("hello world", { letterSpacing: "5px" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("infers negative letterSpacing from computed style", () => {
  const element = mockElement("hello world", { letterSpacing: "-1px" }, 50);
  const truncator = createTruncator(element);
  const result = truncator.truncateByWidth();
  expect(result.text.length).toBeGreaterThan(0);
});

test("infers wordBreak from computed style", () => {
  const cjk = "天地玄黄宇宙洪荒日月盈昃辰宿列张";
  const el = mockElement(cjk, { wordBreak: "keep-all" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("infers whiteSpace from computed style", () => {
  const el = mockElement("line one\nline two\nline three", { whiteSpace: "pre-wrap" }, 300);
  const t = createTruncator(el);
  const h = t.measureHeight({ lineHeight: 20 });
  expect(h).toBeGreaterThanOrEqual(60);
});

test("short text passes through — truncated false", () => {
  const el = mockElement("hi", {}, 500);
  const t = createTruncator(el);
  const r = t.truncate();
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("long text gets truncated — truncated true, ends with …", () => {
  const el = mockElement(LONG, {}, 50);
  const t = createTruncator(el);
  const r = t.truncate();
  expect(r.text.length).toBeLessThan(LONG.length);
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("empty textContent returns empty, truncated false", () => {
  const el = mockElement("", {}, 300);
  const t = createTruncator(el);
  const r = t.truncate();
  expect(r.text).toBe("");
  expect(r.truncated).toBe(false);
});

// ── Group 2: Font Inference (8) ───────────────────────────────

test("font-weight: 700 appears in font string", () => {
  const el = mockElement(LONG, { fontWeight: "700" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-style: italic appears in font string", () => {
  const el = mockElement(LONG, { fontStyle: "italic" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-variant: small-caps appears in font string", () => {
  const el = mockElement(LONG, { fontVariant: "small-caps" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-family with quotes stripped", () => {
  const el = mockElement(LONG, { fontFamily: '"Inter", sans-serif' }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-size: 24px used directly", () => {
  const el = mockElement(LONG, { fontSize: "24px" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-size: 1.5rem converted to px", () => {
  const el = mockElement(LONG, { fontSize: "1.5rem" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-size: 12pt converted to px", () => {
  const el = mockElement(LONG, { fontSize: "12pt" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("font-size: 150% converted to px", () => {
  const el = mockElement(LONG, { fontSize: "150%" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

// ── Group 3: Width Inference (6) ──────────────────────────────

test("clientWidth = 300 → maxWidth 300", () => {
  const el = mockElement("hi", {}, 300);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("clientWidth = 0, getBoundingClientRect width = 250 → maxWidth 250", () => {
  const el = mockElement("hi", {}, 0);
  el.getBoundingClientRect = () => ({ width: 250 });
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("both zero → maxWidth 0 → returns empty, truncated true", () => {
  const el = mockElement("hello", {}, 0);
  el.getBoundingClientRect = () => ({ width: 0 });
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

test("explicit maxWidth override uses override value", () => {
  const el = mockElement(LONG, {}, 500);
  const t = createTruncator(el);
  const r = t.truncateByWidth({ maxWidth: 50 });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("floating point clientWidth preserved", () => {
  const el = mockElement("hi", {}, 198.5);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toBe("hi");
  expect(r.truncated).toBe(false);
});

test("negative clientWidth treated as 0 → returns empty", () => {
  const el = mockElement("hello", {}, -10);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toBe("");
  expect(r.truncated).toBe(true);
});

// ── Group 4: Line Height Inference (5) ────────────────────────

test('lineHeight "normal" resolves to 1.2 * fontSize', () => {
  const el = mockElement(PARA, { lineHeight: "normal" }, 80);
  const t = createTruncator(el);
  const h = t.measureHeight();
  expect(h).toBeGreaterThanOrEqual(19);
});

test('lineHeight "24px" parses to 24', () => {
  const el = mockElement(PARA, { lineHeight: "24px" }, 80);
  const t = createTruncator(el);
  const h = t.measureHeight();
  expect(h).toBeGreaterThanOrEqual(24);
});

test('lineHeight "1.5" (numeric string) → 1.5 * fontSize', () => {
  const el = mockElement(PARA, { lineHeight: "1.5" }, 80);
  const t = createTruncator(el);
  const h = t.measureHeight();
  expect(h).toBeGreaterThanOrEqual(24);
});

test('lineHeight "1.5rem" converts rem to px', () => {
  const el = mockElement(PARA, { lineHeight: "1.5rem" }, 80);
  const t = createTruncator(el);
  const h = t.measureHeight();
  expect(h).toBeGreaterThan(0);
});

test('lineHeight "1.5em" converts em to px', () => {
  const el = mockElement(PARA, { lineHeight: "1.5em" }, 80);
  const t = createTruncator(el);
  const h = t.measureHeight();
  expect(h).toBeGreaterThan(0);
});

// ── Group 5: Override Behavior (8) ────────────────────────────

test("explicit font overrides inferred font", () => {
  const el = mockElement(LONG, { fontSize: "16px" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth({ font: "24px serif" });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("explicit maxWidth overrides inferred width", () => {
  const el = mockElement(LONG, {}, 500);
  const t = createTruncator(el);
  const r = t.truncateByWidth({ maxWidth: 50 });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("explicit CSS maxWidth override uses inferred element font", () => {
  const el = mockElement(LONG, { fontSize: "20px", fontFamily: "serif" }, 500);
  const t = createTruncator(el);

  expect(t.truncateByWidth({ maxWidth: "4em" }).truncated).toBe(true);
  expect(t.truncateByWidth({ maxWidth: "4ch" }).truncated).toBe(true);
});

test("explicit lineHeight overrides inferred lineHeight", () => {
  const el = mockElement(PARA, { lineHeight: "20px" }, 80);
  const t = createTruncator(el);
  const r = t.truncateByLines({ maxLines: 2, lineHeight: 30 });
  expect(r.text).toMatch(/…$/);
  expect(r.text.split("\n").length).toBe(2);
});

test("explicit ellipsis overrides default …", () => {
  const el = mockElement(LONG, {}, 120);
  const t = createTruncator(el);
  const r = t.truncateByWidth({ ellipsis: " [more]" });
  expect(r.text).toMatch(/\[more\]$/);
  expect(r.truncated).toBe(true);
});

test("explicit maxLines enables line truncation mode", () => {
  const el = mockElement(PARA, {}, 80);
  const t = createTruncator(el);
  const r = t.truncate({ maxLines: 2 });
  expect(r.text).toMatch(/…$/);
  expect(r.text.split("\n").length).toBe(2);
  expect(r.truncated).toBe(true);
});

test("explicit wordBreak overrides inferred wordBreak", () => {
  const cjk = "天地玄黄宇宙洪荒日月盈昃辰宿列张";
  const el = mockElement(cjk, { wordBreak: "normal" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth({ wordBreak: "keep-all" });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("explicit letterSpacing overrides inferred letterSpacing", () => {
  const el = mockElement("hello world", { letterSpacing: "0px" }, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth({ letterSpacing: 5 });
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("explicit whiteSpace overrides inferred whiteSpace", () => {
  const el = mockElement("line one\nline two", { whiteSpace: "normal" }, 300);
  const t = createTruncator(el);
  const h = t.measureHeight({ whiteSpace: "pre-wrap", lineHeight: 20 });
  expect(h).toBeGreaterThanOrEqual(40);
});

test("unsupported CSS wordBreak and whiteSpace values are not passed through", () => {
  const element = mockElement("line one line two", {
    wordBreak: "break-word",
    whiteSpace: "nowrap",
  });
  const truncator = createTruncator(element);
  const result = truncator.truncateByWidth();
  expect(result.truncated).toBe(false);
});

// ── Group 6: Write-Back (4) ───────────────────────────────────

test("truncated result is written to element.textContent", () => {
  const el = mockElement(LONG, {}, 50);
  const t = createTruncator(el);
  t.truncate();
  expect(el.textContent).toMatch(/…$/);
  expect(el.textContent!.length).toBeLessThan(LONG.length);
});

test("element.textContent matches result.text after call", () => {
  const el = mockElement(LONG, {}, 50);
  const t = createTruncator(el);
  const r = t.truncate();
  expect(el.textContent).toBe(r.text);
});

test("non-truncated text — element.textContent unchanged", () => {
  const el = mockElement("hi", {}, 500);
  const t = createTruncator(el);
  t.truncate();
  expect(el.textContent).toBe("hi");
});

test("write-back happens even when text is empty", () => {
  const el = mockElement("", {}, 300);
  const t = createTruncator(el);
  const r = t.truncate();
  expect(el.textContent).toBe("");
  expect(r.text).toBe("");
});

// ── Group 7: Edge Cases (9) ───────────────────────────────────

test("element with emoji text", () => {
  const el = mockElement("Hello 😀 world 🌍 here", {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("element with CJK text", () => {
  const el = mockElement("天地玄黄宇宙洪荒日月盈昃辰宿列张", {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("element with RTL Arabic text", () => {
  const el = mockElement("مرحبا بالعالم هذا نص طويل", {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text.length).toBeGreaterThan(0);
  expect(r.truncated).toBe(true);
});

test("element with combining marks", () => {
  const el = mockElement("café résumé naïve", {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("element with newlines + whiteSpace pre-wrap", () => {
  const el = mockElement("line one\nline two\nline three", { whiteSpace: "pre-wrap" }, 300);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/^line one/);
  expect(r.truncated).toBe(true);
});

test("element with very long unbreakable word", () => {
  const long = "a".repeat(200);
  const el = mockElement(long, {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text.length).toBeLessThan(long.length);
  expect(r.text).toMatch(/…$/);
  expect(r.truncated).toBe(true);
});

test("element with surrogate pairs", () => {
  const el = mockElement("Hello 😀 world", {}, 50);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toMatch(/…$/);
  expect(r.text.includes("\uFFFD")).toBe(false);
});

test("element with whitespace-only text", () => {
  const el = mockElement("   ", {}, 300);
  const t = createTruncator(el);
  const r = t.truncateByWidth();
  expect(r.text).toBe("   ");
  expect(r.truncated).toBe(false);
});

test("element with CRLF line endings", () => {
  const el = mockElement("line one\r\nline two\r\nline three", { whiteSpace: "pre-wrap" }, 300);
  const t = createTruncator(el);
  const r = t.truncateByLines({ maxLines: 2 });
  expect(r.text.split("\n").length).toBeLessThanOrEqual(2);
  expect(r.truncated).toBe(true);
});

test("bound truncator does not compound prior write-back", () => {
  const el = mockElement(LONG, {}, 50);
  const t = createTruncator(el);
  const narrow = t.truncateByWidth();
  expect(narrow.truncated).toBe(true);
  const wide = t.truncateByWidth({ maxWidth: 5000 });
  expect(wide.text).toBe(LONG);
  expect(wide.truncated).toBe(false);
  expect(el.textContent).toBe(LONG);
});

test("bound truncator picks up external textContent changes", () => {
  const el = mockElement(LONG, {}, 50);
  const t = createTruncator(el);
  t.truncateByWidth();
  el.textContent = "short text";
  const r = t.truncateByWidth({ maxWidth: 500 });
  expect(r.text).toBe("short text");
  expect(r.truncated).toBe(false);
});

test("accepts a DOM-compatible custom object without Element casts", () => {
  const customElement = {
    nodeType: 1 as const,
    textContent: LONG,
    clientWidth: 50,
    getBoundingClientRect: () => ({ width: 50 }),
    computedStyle: {
      fontSize: "16px",
      fontFamily: "sans-serif",
      lineHeight: "normal",
      letterSpacing: "normal",
      wordBreak: "normal",
      whiteSpace: "normal",
    },
  } satisfies DOMCompatibleElement;

  const truncator = createTruncator(customElement);
  const result = truncator.truncateByWidth();

  expect(result.text).toMatch(/…$/);
  expect(customElement.textContent).toBe(result.text);
});

test("accepts a real DOM Element type at compile time", () => {
  const element = {
    nodeType: 1,
    textContent: "short text",
    clientWidth: 300,
  } as Element;

  const truncator = createTruncator(element);
  const result = truncator.truncateByWidth();

  expect(result.text).toBe("short text");
});

test("custom adapters without computedStyle do not call browser getComputedStyle", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "getComputedStyle");
  Object.defineProperty(globalThis, "getComputedStyle", {
    configurable: true,
    value: () => {
      throw new Error("getComputedStyle should not be called for custom adapters");
    },
  });

  try {
    const customElement = {
      nodeType: 1 as const,
      textContent: "short text",
      clientWidth: 300,
    } satisfies DOMCompatibleElement;
    const result = createTruncator(customElement).truncateByWidth();
    expect(result.text).toBe("short text");
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "getComputedStyle", originalDescriptor);
    } else {
      delete (globalThis as { getComputedStyle?: typeof getComputedStyle }).getComputedStyle;
    }
  }
});

test("custom adapters without a width source fail before write-back", () => {
  const customElement = {
    nodeType: 1 as const,
    textContent: "keep me",
  };

  expect(() => createTruncator(customElement as unknown as DOMCompatibleElement)).toThrow(
    /requires clientWidth/,
  );
  expect(customElement.textContent).toBe("keep me");
});

test("document.querySelector result matches the public overload", () => {
  const element = {
    nodeType: 1,
    textContent: "query text",
    clientWidth: 300,
  } as Element;
  const querySelector = () => element;

  const truncator = createTruncator(querySelector());

  expect(truncator.truncate().text).toBe("query text");
});

test("supports custom DOM-compatible elements with custom computedStyle", () => {
  class CustomLabel {
    readonly nodeType = 1;
    textContent: string | null = LONG;
    readonly clientWidth = 50;
    readonly computedStyle = {
      fontSize: "24px",
      fontFamily: "serif",
      lineHeight: "1.5",
      letterSpacing: "1px",
      wordBreak: "normal",
      whiteSpace: "normal",
    };

    getBoundingClientRect() {
      return { width: this.clientWidth };
    }
  }

  const element = new CustomLabel();
  const truncator = createTruncator(element);
  const result = truncator.truncateByWidth();

  expect(result.truncated).toBe(true);
  expect(element.textContent).toBe(result.text);
});

test("bound measureHeight uses the source text, not the previous write-back", () => {
  const element = mockElement(PARA, {}, 50);
  const truncator = createTruncator(element);
  truncator.truncateByWidth();

  const height = truncator.measureHeight({ maxWidth: 80, lineHeight: 20 });
  const expected = measureHeight(PARA, { font: FONT, maxWidth: 80, lineHeight: 20 });

  expect(height).toBe(expected);
});

import type {
  DOMCompatibleElement,
  DOMCompatibleStyle,
  TruncateOptions,
  WordBreakMode,
  WhiteSpaceMode,
} from "./types.js";

export function isElement(arg: unknown): arg is DOMCompatibleElement {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "nodeType" in arg &&
    (arg as { nodeType?: unknown }).nodeType === 1 &&
    "textContent" in arg
  );
}

function isNativeElement(element: DOMCompatibleElement): element is Element & DOMCompatibleElement {
  if (typeof Element !== "undefined" && element instanceof Element) return true;
  const ViewElement = (
    element as { ownerDocument?: { defaultView?: { Element?: typeof Element } | null } }
  ).ownerDocument?.defaultView?.Element;
  return typeof ViewElement === "function" && element instanceof ViewElement;
}

function isStyleRecord(value: unknown): value is DOMCompatibleStyle {
  return typeof value === "object" && value !== null;
}

function readStyles(element: DOMCompatibleElement): DOMCompatibleStyle {
  const customStyle = "computedStyle" in element ? element.computedStyle : undefined;
  if (isStyleRecord(customStyle)) return customStyle;
  if (isNativeElement(element) && typeof getComputedStyle === "function")
    return getComputedStyle(element) as unknown as DOMCompatibleStyle;
  return {};
}

export function readText(element: DOMCompatibleElement): string {
  return element.textContent ?? "";
}

export function writeText(element: DOMCompatibleElement, text: string): void {
  element.textContent = text;
}

function getRootFontSize(): number {
  if (typeof document !== "undefined" && document.documentElement)
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return 16;
}

function parseSizeToPx(value: number, unit: string, fontSize: number): number | null {
  const root = getRootFontSize();
  if (unit === "pt") return value * 1.333;
  if (unit === "rem") return value * root;
  if (unit === "em") return value * fontSize;
  if (unit === "%") return (value / 100) * fontSize;
  return null;
}

function parseFontSize(raw: string): number {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d+(?:\.\d+)?)\s*(px|pt|rem|em|%)$/);
  if (!m) return parseFloat(trimmed) || 16;
  const val = parseFloat(m[1]);
  const unit = m[2];
  if (unit === "px") return val;
  return parseSizeToPx(val, unit, 16) ?? 16;
}

export function resolveLineHeight(raw: string, fontSize: number): number {
  const trimmed = raw.trim();
  if (trimmed === "normal" || !trimmed) return Math.round(fontSize * 1.2);
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Math.round(parseFloat(trimmed) * fontSize);
  const m = trimmed.match(/^(\d+(?:\.\d+)?)\s*(px|pt|rem|em|%)$/);
  if (!m) return parseFloat(trimmed) || Math.round(fontSize * 1.2);
  const val = parseFloat(m[1]);
  const unit = m[2];
  if (unit === "px") return val;
  return parseSizeToPx(val, unit, fontSize) ?? Math.round(fontSize * 1.2);
}

function parsePxValue(raw: string): number | undefined {
  if (raw === "normal" || !raw || raw === "0px") return undefined;
  const m = raw.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))\s*px$/);
  return m ? parseFloat(m[1]) : undefined;
}

function resolveWordBreak(raw: string | undefined): WordBreakMode | undefined {
  const value = raw?.trim();
  return value === "normal" || value === "keep-all" ? value : undefined;
}

function resolveWhiteSpace(raw: string | undefined): WhiteSpaceMode | undefined {
  const value = raw?.trim();
  return value === "normal" || value === "pre-wrap" ? value : undefined;
}

function resolveElementWidth(
  element: DOMCompatibleElement,
  overrides: Partial<TruncateOptions> | undefined,
): TruncateOptions["maxWidth"] {
  if (overrides?.maxWidth !== undefined) return overrides.maxWidth;

  const clientWidth = element.clientWidth;
  if (clientWidth !== undefined && clientWidth !== 0) return clientWidth;

  const rectWidth = element.getBoundingClientRect?.().width;
  if (rectWidth !== undefined) return clientWidth || rectWidth;
  if (clientWidth !== undefined) return clientWidth;

  throw new TypeError(
    "truncate: createTruncator(element) requires clientWidth, getBoundingClientRect().width, or a maxWidth override",
  );
}

function buildFontString(cs: DOMCompatibleStyle, fontSize: number): string {
  const parts = [
    cs.fontStyle,
    cs.fontVariant,
    cs.fontWeight,
    `${fontSize}px`,
    cs.fontFamily?.replace(/"/g, "") ?? "sans-serif",
  ];
  return parts
    .map((p) => p?.trim())
    .filter((p) => p && p !== "normal")
    .join(" ");
}

export function inferFromElement(
  element: DOMCompatibleElement,
  overrides?: Partial<TruncateOptions>,
): TruncateOptions {
  const cs = readStyles(element);
  const fontSize = parseFontSize(cs.fontSize ?? "16px");
  const font = overrides?.font ?? buildFontString(cs, fontSize);
  const maxWidth = resolveElementWidth(element, overrides);
  const lineHeight =
    overrides?.lineHeight ?? resolveLineHeight(cs.lineHeight ?? "normal", fontSize);
  const letterSpacing = overrides?.letterSpacing ?? parsePxValue(cs.letterSpacing ?? "normal");
  const wordBreak = overrides?.wordBreak ?? resolveWordBreak(cs.wordBreak);
  const whiteSpace = overrides?.whiteSpace ?? resolveWhiteSpace(cs.whiteSpace);
  const result: TruncateOptions = {
    font,
    maxWidth,
    lineHeight,
  };
  if (letterSpacing !== undefined) result.letterSpacing = letterSpacing;
  if (wordBreak !== undefined) result.wordBreak = wordBreak;
  if (whiteSpace !== undefined) result.whiteSpace = whiteSpace;
  if (overrides?.ellipsis !== undefined) result.ellipsis = overrides.ellipsis;
  if (overrides?.maxLines !== undefined) result.maxLines = overrides.maxLines;
  if (overrides?.keepLines !== undefined) result.keepLines = overrides.keepLines;
  if (overrides?.context !== undefined) result.context = overrides.context;
  if (overrides?.before !== undefined) result.before = overrides.before;
  if (overrides?.after !== undefined) result.after = overrides.after;
  if (overrides?.selector !== undefined) result.selector = overrides.selector;
  return result;
}

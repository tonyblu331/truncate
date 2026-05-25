import type { CssWidth } from "./types.js";

let autoFont: string | null = null;
const fiber = new Map<string, string>();
let measureContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

export function detectFont(): string {
  if (autoFont) return autoFont;
  if (typeof document === "undefined" || !document.body)
    throw new Error("truncate: specify `font` option or call `detectFont()` in the browser");
  const style = getComputedStyle(document.body);
  const px = parseFloat(style.fontSize) || 16;
  const parts = [style.fontStyle, style.fontVariant, style.fontWeight, `${px}px`, style.fontFamily]
    .map((part) => part.trim())
    .filter((part) => part && part !== "normal");
  return (autoFont = parts.join(" "));
}

export function register(sel: string, config: { font: string }): void {
  fiber.set(sel, config.font);
}

function getRootFontSize(): number {
  if (typeof document !== "undefined" && document.documentElement)
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return 16;
}

function sizeToPx(value: number, unit: string): number | null {
  const root = getRootFontSize();
  if (unit === "pt") return value * 1.333;
  if (unit === "rem" || unit === "em") return value * root;
  if (unit === "%") return (value / 100) * root;
  return null;
}

function normalizeFont(font: string): string {
  let i = 0;
  while (i < font.length) {
    const c = font[i];
    if ((c >= "0" && c <= "9") || c === ".") {
      const numStart = i;
      if (c === ".") i++;
      while (i < font.length && ((font[i] >= "0" && font[i] <= "9") || font[i] === ".")) i++;
      const numStr = font.slice(numStart, i);
      const afterNum = i;
      while (i < font.length && font[i] === " ") i++;
      const unitStart = i;
      while (i < font.length && font[i] >= "a" && font[i] <= "z") i++;
      const unit = font.slice(unitStart, i).toLowerCase();
      if (unit === "px") return font;
      const px = sizeToPx(parseFloat(numStr), unit);
      if (px !== null) return font.slice(0, numStart) + px + "px" + font.slice(i);
      i = afterNum;
      continue;
    }
    i++;
  }
  return font;
}

export function extractFontSize(font: string): number {
  const m = font.match(/(\d+(?:\.\d+)?)\s*px/);
  return m ? parseFloat(m[1]) : 16;
}

export function resolveFont(opts: { font?: string; selector?: string }): string {
  if (opts.font) return normalizeFont(opts.font);
  if (opts.selector) {
    const f = fiber.get(opts.selector);
    if (f) return normalizeFont(f);
  }
  return detectFont();
}

function getMeasureContext() {
  if (measureContext) return measureContext;
  if (typeof OffscreenCanvas !== "undefined") {
    measureContext = new OffscreenCanvas(0, 0).getContext("2d")!;
    return measureContext;
  }
  if (typeof document !== "undefined") {
    measureContext = document.createElement("canvas").getContext("2d")!;
    return measureContext;
  }
  throw new Error("truncate: text measurement requires OffscreenCanvas or a DOM canvas context");
}

function getStringWidth(str: string, font: string): number {
  const ctx = getMeasureContext();
  ctx.font = font;
  return ctx.measureText(str).width;
}

function getViewportSize() {
  return typeof window !== "undefined"
    ? { width: window.innerWidth, height: window.innerHeight }
    : { width: 0, height: 0 };
}

export function parseCssWidth(value: CssWidth, fontSize?: number, font?: string): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("truncate: maxWidth must be finite");
    return value;
  }
  const raw = value.trim();
  if (!raw) throw new TypeError("truncate: maxWidth value cannot be empty");
  const s = raw.startsWith(".") ? "0" + raw : raw;
  let i = 0;
  if (s[i] === "-") throw new TypeError("truncate: maxWidth cannot be negative");
  while (i < s.length && ((s[i] >= "0" && s[i] <= "9") || s[i] === ".")) i++;
  if (i === 0) throw new TypeError(`truncate: "${value}" is not a valid maxWidth`);
  const num = parseFloat(s.slice(0, i));
  const unit = s.slice(i).trim().toLowerCase() || "px";
  switch (unit) {
    case "px":
      return num;
    case "rem":
      return num * getRootFontSize();
    case "em":
      return num * (fontSize ?? 16);
    case "ch": {
      if (!font && typeof document === "undefined")
        throw new TypeError(`truncate: ch unit requires a font in ${value}`);
      return num * getStringWidth("0", font ?? "16px sans-serif");
    }
    case "vw":
      return (num * getViewportSize().width) / 100;
    case "vh":
      return (num * getViewportSize().height) / 100;
    case "vmin": {
      const vp = getViewportSize();
      return (num * Math.min(vp.width, vp.height)) / 100;
    }
    case "vmax": {
      const vp = getViewportSize();
      return (num * Math.max(vp.width, vp.height)) / 100;
    }
    case "%":
      throw new TypeError(`truncate: % is not supported in maxWidth "${value}". Use vw.`);
    case "fr":
      throw new TypeError(
        `truncate: fr is not supported in maxWidth "${value}". fr is a CSS Grid unit.`,
      );
    default:
      throw new TypeError(
        `truncate: unsupported unit "${unit}" in maxWidth "${value}". Supported: px, rem, em, ch, vw, vh, vmin, vmax.`,
      );
  }
}

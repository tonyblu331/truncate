import { prepare, layout, prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

export type WordBreakMode = "normal" | "keep-all";
export type WhiteSpaceMode = "normal" | "pre-wrap";

export type CssWidth = number | string;

export interface TruncateOptions {
  font?: string;
  selector?: string;
  maxWidth: CssWidth;
  ellipsis?: string;
  lineHeight?: number;
  maxLines?: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
}

export interface MeasureOptions {
  font?: string;
  selector?: string;
  maxWidth: CssWidth;
  lineHeight: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
}

export interface TruncatorConfig {
  font?: string;
  selector?: string;
  lineHeight?: number;
  ellipsis?: string;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
}

export type TruncatorCallOptions = {
  font?: string;
  maxWidth: CssWidth;
  ellipsis?: string;
  lineHeight?: number;
  maxLines?: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

export type TruncatorMeasureOptions = {
  font?: string;
  maxWidth: CssWidth;
  lineHeight?: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

export interface TruncateMetrics {
  originalLineCount: number;
}

export interface TruncateResult {
  text: string;
  original: string;
  truncated: boolean;
  metrics: TruncateMetrics;
}

export interface Truncator {
  truncateByWidth(text: string, options?: TruncatorCallOptions): TruncateResult;
  truncateByLines(text: string, options?: TruncatorCallOptions): TruncateResult;
  truncateStart(text: string, options?: TruncatorCallOptions): TruncateResult;
  truncateMiddle(text: string, options?: TruncatorCallOptions): TruncateResult;
  measureHeight(text: string, options?: TruncatorMeasureOptions): number;
  truncate(text: string, options?: TruncatorCallOptions): TruncateResult;
}

type PretextExtras = {
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

// ── Font registry ──────────────────────────────────────────────

let autoFont: string | null = null;
const fiber = new Map<string, string>();

function detect(): string {
  if (autoFont) return autoFont;
  if (typeof document === "undefined" || !document.body) {
    throw new Error("truncate: specify `font` option or call `detectFont()` in the browser");
  }
  const style = getComputedStyle(document.body);
  const px = parseFloat(style.fontSize) || 16;
  const commaIdx = style.fontFamily.indexOf(",");
  const first =
    commaIdx > -1 ? style.fontFamily.slice(0, commaIdx).trim() : style.fontFamily.trim();
  const quoted = first.startsWith("'") || first.startsWith('"') ? first : `'${first}'`;
  autoFont = `${px}px ${quoted}`;
  return autoFont;
}

export function detectFont(): string {
  return detect();
}

export function register(sel: string, config: { font: string }): void {
  fiber.set(sel, config.font);
}

function resolveFont(opts: { font?: string; selector?: string }): string {
  if (opts.font) return normalizeFont(opts.font);
  if (opts.selector) {
    const f = fiber.get(opts.selector);
    if (f) return normalizeFont(f);
  }
  return detect();
}

// ── Internals ──────────────────────────────────────────────────

function prep(text: string, font: string, extras?: PretextExtras) {
  return prepare(text, font, extras as Parameters<typeof prepare>[2]);
}

function prepSeg(text: string, font: string, extras?: PretextExtras) {
  return prepareWithSegments(text, font, extras as Parameters<typeof prepareWithSegments>[2]);
}

function lineCount(text: string, font: string, maxWidth: number, extras?: PretextExtras): number {
  if (!text) return 0;
  return layout(prep(text, font, extras), maxWidth, 1).lineCount;
}

function narrow(
  text: string,
  font: string,
  maxWidth: number,
  ellipsis: string,
  extras?: PretextExtras,
): string {
  const graphemes = toGraphemes(text);
  let lo = 0;
  let hi = graphemes.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lineCount(graphemes.slice(0, mid).join("") + ellipsis, font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const result = graphemes.slice(0, lo).join("") + ellipsis;
  if (lineCount(result, font, maxWidth, extras) > 1) return ellipsis;
  return result;
}

function extractExtras(o: TruncateOptions | MeasureOptions): PretextExtras | undefined {
  const e: PretextExtras = {};
  if (o.wordBreak !== undefined) e.wordBreak = o.wordBreak;
  if (o.letterSpacing !== undefined) e.letterSpacing = o.letterSpacing;
  if (o.whiteSpace !== undefined) e.whiteSpace = o.whiteSpace;
  return Object.keys(e).length ? e : undefined;
}

function pickEllipsis(o: TruncateOptions): string {
  return o.ellipsis ?? "\u2026";
}

function toGraphemes(text: string): string[] {
  return [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
}

function getRootFontSize(): number {
  if (typeof document !== "undefined" && document.documentElement) {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }
  return 16;
}

function sizeToPx(value: number, unit: string): number | null {
  const root = getRootFontSize();
  switch (unit) {
    case "pt":
      return value * 1.333;
    case "rem":
      return value * root;
    case "em":
      return value * root;
    case "%":
      return (value / 100) * root;
    default:
      return null;
  }
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
      if (px !== null) {
        return font.slice(0, numStart) + px + "px" + font.slice(i);
      }
      i = afterNum;
      continue;
    }
    i++;
  }
  return font;
}

function extractFontSize(font: string): number {
  const m = font.match(/(\d+(?:\.\d+)?)\s*px/);
  return m ? parseFloat(m[1]) : 16;
}

function getMeasureContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(0, 0).getContext("2d")!;
  }
  const cvs = document.createElement("canvas");
  return cvs.getContext("2d")!;
}

function getStringWidth(str: string, font: string): number {
  const ctx = getMeasureContext();
  ctx.font = font;
  return ctx.measureText(str).width;
}

function getViewportSize(): { width: number; height: number } {
  if (typeof window !== "undefined") {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 0, height: 0 };
}

function parseCssWidth(value: CssWidth, fontSize?: number, font?: string): number {
  if (typeof value === "number") return value;

  const raw = value.trim();
  if (!raw) throw new TypeError(`truncate: maxWidth value cannot be empty`);

  const s = raw.startsWith(".") ? "0" + raw : raw;

  let i = 0;
  if (s[i] === "-") throw new TypeError(`truncate: maxWidth cannot be negative`);

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
      throw new TypeError(
        `truncate: % is not supported in maxWidth "${value}". Use vw (viewport width) for percentage-of-viewport, or pass a resolved pixel width.`,
      );
    case "fr":
      throw new TypeError(
        `truncate: fr is not supported in maxWidth "${value}". fr is a CSS Grid unit and cannot be resolved without a grid container. Pass a resolved pixel value instead.`,
      );
    default:
      throw new TypeError(
        `truncate: unsupported unit "${unit}" in maxWidth "${value}". ` +
          `Supported units: px, rem, em, ch, vw, vh, vmin, vmax.`,
      );
  }
}

// ── Public API ─────────────────────────────────────────────────

export function truncateByWidth(text: string, options: TruncateOptions): TruncateResult {
  const ellipsis = pickEllipsis(options);
  const original = text;
  if (!text) return { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } };
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  if (maxWidth <= 0)
    return { text: "", original, truncated: true, metrics: { originalLineCount: 0 } };

  const fullLineCount = lineCount(text, font, maxWidth, extras);
  if (fullLineCount <= 1)
    return { text, original, truncated: false, metrics: { originalLineCount: fullLineCount } };

  const pSeg = prepSeg(text, font, extras);
  const { lines } = layoutWithLines(pSeg, maxWidth, 1);
  const firstLine = lines[0].text;
  const candidate = firstLine + ellipsis;

  if (lineCount(candidate, font, maxWidth, extras) <= 1) {
    return {
      text: candidate,
      original,
      truncated: true,
      metrics: { originalLineCount: fullLineCount },
    };
  }

  const result = narrow(firstLine, font, maxWidth, ellipsis, extras);
  return { text: result, original, truncated: true, metrics: { originalLineCount: fullLineCount } };
}

export function truncateByLines(text: string, options: TruncateOptions): TruncateResult {
  const ellipsis = pickEllipsis(options);
  const original = text;
  if (!text) return { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } };
  const maxLines = options.maxLines ?? 1;
  if (maxLines <= 0)
    return { text: "", original, truncated: true, metrics: { originalLineCount: 0 } };
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  if (maxWidth <= 0)
    return { text: "", original, truncated: true, metrics: { originalLineCount: 0 } };
  const lh = options.lineHeight ?? 20;

  const prepared = prepSeg(text, font, extras);
  const { lines } = layoutWithLines(prepared, maxWidth, lh);
  const originalLineCount = lines.length;

  if (lines.length <= maxLines) {
    return { text, original, truncated: false, metrics: { originalLineCount } };
  }

  const leading = lines.slice(0, maxLines - 1);
  const prefix = leading.map((l) => l.text).join("\n");
  const lastSource = lines[maxLines - 1].text;
  const metrics = { originalLineCount };

  if (lineCount(lastSource + ellipsis, font, maxWidth, extras) <= 1) {
    const result =
      leading.length > 0 ? prefix + "\n" + lastSource + ellipsis : lastSource + ellipsis;
    return { text: result, original, truncated: true, metrics };
  }

  const truncated = narrow(lastSource, font, maxWidth, ellipsis, extras);
  const result = leading.length > 0 ? prefix + "\n" + truncated : truncated;
  return { text: result, original, truncated: true, metrics };
}

export function measureHeight(text: string, options: MeasureOptions): number {
  if (!text) return 0;
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  if (maxWidth <= 0) return 0;
  const lh = options.lineHeight ?? 20;
  const p = prep(text, font, extras);
  const { height } = layout(p, maxWidth, lh);
  return Math.max(height, lh);
}

export function truncateMiddle(text: string, options: TruncateOptions): TruncateResult {
  const ellipsis = pickEllipsis(options);
  const original = text;
  if (!text) return { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } };
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  if (maxWidth <= 0)
    return { text: "", original, truncated: true, metrics: { originalLineCount: 0 } };

  const fullLineCount = lineCount(text, font, maxWidth, extras);
  if (fullLineCount <= 1)
    return { text, original, truncated: false, metrics: { originalLineCount: fullLineCount } };

  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  let lo = 0;
  let hi = n;

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const prefixLen = Math.ceil(mid / 2);
    const suffixLen = Math.floor(mid / 2);
    const candidate =
      graphemes.slice(0, prefixLen).join("") + ellipsis + graphemes.slice(n - suffixLen).join("");
    if (lineCount(candidate, font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  const prefixLen = Math.ceil(lo / 2);
  const suffixLen = Math.floor(lo / 2);
  const result =
    graphemes.slice(0, prefixLen).join("") + ellipsis + graphemes.slice(n - suffixLen).join("");
  if (lineCount(result, font, maxWidth, extras) > 1) {
    return {
      text: ellipsis,
      original,
      truncated: true,
      metrics: { originalLineCount: fullLineCount },
    };
  }
  return { text: result, original, truncated: true, metrics: { originalLineCount: fullLineCount } };
}

export function truncateStart(text: string, options: TruncateOptions): TruncateResult {
  const ellipsis = pickEllipsis(options);
  const original = text;
  if (!text) return { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } };
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  if (maxWidth <= 0)
    return { text: "", original, truncated: true, metrics: { originalLineCount: 0 } };

  const fullLineCount = lineCount(text, font, maxWidth, extras);
  if (fullLineCount <= 1)
    return { text, original, truncated: false, metrics: { originalLineCount: fullLineCount } };

  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lineCount(ellipsis + graphemes.slice(n - mid).join(""), font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const result = ellipsis + graphemes.slice(n - lo).join("");
  if (lineCount(result, font, maxWidth, extras) > 1) {
    return {
      text: ellipsis,
      original,
      truncated: true,
      metrics: { originalLineCount: fullLineCount },
    };
  }
  return { text: result, original, truncated: true, metrics: { originalLineCount: fullLineCount } };
}

export function truncate(text: string, options: TruncateOptions): TruncateResult {
  return options.maxLines !== undefined
    ? truncateByLines(text, options)
    : truncateByWidth(text, options);
}

export function createTruncator(config: TruncatorConfig): Truncator {
  const sel = config.selector;
  const defaults: Partial<TruncateOptions> = {};
  if (config.lineHeight !== undefined) defaults.lineHeight = config.lineHeight;
  if (config.ellipsis !== undefined) defaults.ellipsis = config.ellipsis;
  if (config.wordBreak !== undefined) defaults.wordBreak = config.wordBreak;
  if (config.letterSpacing !== undefined) defaults.letterSpacing = config.letterSpacing;
  if (config.whiteSpace !== undefined) defaults.whiteSpace = config.whiteSpace;
  if (config.font !== undefined) defaults.font = config.font;
  if (sel !== undefined) defaults.selector = sel;

  return {
    truncateByWidth(text, opts) {
      return truncateByWidth(text, { ...defaults, ...opts } as TruncateOptions);
    },
    truncateByLines(text, opts) {
      return truncateByLines(text, { ...defaults, ...opts } as TruncateOptions);
    },
    measureHeight(text, opts) {
      return measureHeight(text, { ...defaults, ...opts } as MeasureOptions);
    },
    truncateStart(text, opts) {
      return truncateStart(text, { ...defaults, ...opts } as TruncateOptions);
    },
    truncateMiddle(text, opts) {
      return truncateMiddle(text, { ...defaults, ...opts } as TruncateOptions);
    },
    truncate(text, opts) {
      return truncate(text, { ...defaults, ...opts } as TruncateOptions);
    },
  };
}

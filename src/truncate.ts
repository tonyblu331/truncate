import { prepare, layout, prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

export type WordBreakMode = "normal" | "keep-all";
export type WhiteSpaceMode = "normal" | "pre-wrap";

export interface TruncateOptions {
  font?: string;
  selector?: string;
  maxWidth: number;
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
  maxWidth: number;
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
  maxWidth: number;
  ellipsis?: string;
  lineHeight?: number;
  maxLines?: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

export type TruncatorMeasureOptions = {
  font?: string;
  maxWidth: number;
  lineHeight?: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

export interface Truncator {
  truncateByWidth(text: string, options?: TruncatorCallOptions): string;
  truncateByLines(text: string, options?: TruncatorCallOptions): string;
  truncateStart(text: string, options?: TruncatorCallOptions): string;
  truncateMiddle(text: string, options?: TruncatorCallOptions): string;
  measureHeight(text: string, options?: TruncatorMeasureOptions): number;
  truncate(text: string, options?: TruncatorCallOptions): string;
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
  if (opts.font) return opts.font;
  if (opts.selector) {
    const f = fiber.get(opts.selector);
    if (f) return f;
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
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lineCount(text.slice(0, mid) + ellipsis, font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return text.slice(0, lo) + ellipsis;
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

// ── Public API ─────────────────────────────────────────────────

export function truncateByWidth(text: string, options: TruncateOptions): string {
  const ellipsis = pickEllipsis(options);
  if (!text) return "";
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const { maxWidth } = options;
  if (maxWidth <= 0) return "";

  if (lineCount(text, font, maxWidth, extras) <= 1) return text;

  const pSeg = prepSeg(text, font, extras);
  const { lines } = layoutWithLines(pSeg, maxWidth, 1);
  const firstLine = lines[0].text;
  const candidate = firstLine + ellipsis;

  if (lineCount(candidate, font, maxWidth, extras) <= 1) return candidate;

  return narrow(firstLine, font, maxWidth, ellipsis, extras);
}

export function truncateByLines(text: string, options: TruncateOptions): string {
  const ellipsis = pickEllipsis(options);
  if (!text) return "";
  const maxLines = options.maxLines ?? 1;
  if (maxLines <= 0) return "";
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const { maxWidth } = options;
  if (maxWidth <= 0) return "";
  const lh = options.lineHeight ?? 20;

  const prepared = prepSeg(text, font, extras);
  const { lines } = layoutWithLines(prepared, maxWidth, lh);

  if (lines.length <= maxLines) return text;

  const leading = lines.slice(0, maxLines - 1);
  const prefix = leading.map((l) => l.text).join("\n");
  const lastSource = lines[maxLines - 1].text;

  if (lineCount(lastSource + ellipsis, font, maxWidth, extras) <= 1) {
    return leading.length > 0 ? prefix + "\n" + lastSource + ellipsis : lastSource + ellipsis;
  }

  const truncated = narrow(lastSource, font, maxWidth, ellipsis, extras);
  return leading.length > 0 ? prefix + "\n" + truncated : truncated;
}

export function measureHeight(text: string, options: MeasureOptions): number {
  if (!text) return 0;
  if (options.maxWidth <= 0) return 0;
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const p = prep(text, font, extras);
  const { height } = layout(p, options.maxWidth, options.lineHeight);
  return Math.max(height, options.lineHeight);
}

export function truncateMiddle(text: string, options: TruncateOptions): string {
  const ellipsis = pickEllipsis(options);
  if (!text) return "";
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const { maxWidth } = options;
  if (maxWidth <= 0) return "";

  if (lineCount(text, font, maxWidth, extras) <= 1) return text;

  const n = text.length;
  let lo = 0;
  let hi = n;

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const prefixLen = Math.ceil(mid / 2);
    const suffixLen = Math.floor(mid / 2);
    const candidate = text.slice(0, prefixLen) + ellipsis + text.slice(n - suffixLen);
    if (lineCount(candidate, font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  const prefixLen = Math.ceil(lo / 2);
  const suffixLen = Math.floor(lo / 2);
  return text.slice(0, prefixLen) + ellipsis + text.slice(n - suffixLen);
}

export function truncateStart(text: string, options: TruncateOptions): string {
  const ellipsis = pickEllipsis(options);
  if (!text) return "";
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const { maxWidth } = options;
  if (maxWidth <= 0) return "";

  if (lineCount(text, font, maxWidth, extras) <= 1) return text;

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lineCount(ellipsis + text.slice(-mid), font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return ellipsis + text.slice(-lo);
}

export function truncate(text: string, options: TruncateOptions): string {
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

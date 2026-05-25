import { prepare, layout, prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

export type WordBreakMode = "normal" | "keep-all";
export type WhiteSpaceMode = "normal" | "pre-wrap";
export type CssWidth = number | string;

export interface TruncateOptions {
  font?: string;
  selector?: string;
  maxWidth: CssWidth;
  ellipsis?: string;
  maxLines?: number;
  keepLines?: number[];
  lineHeight?: number;
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
  context?: number;
  before?: number;
  after?: number;
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

export interface TruncateResult {
  text: string;
  original: string;
  truncated: boolean;
  metrics: { originalLineCount: number };
}

let autoFont: string | null = null;
const fiber = new Map<string, string>();

export function detectFont(): string {
  if (autoFont) return autoFont;
  if (typeof document === "undefined" || !document.body)
    throw new Error("truncate: specify `font` option or call `detectFont()` in the browser");
  const style = getComputedStyle(document.body);
  const px = parseFloat(style.fontSize) || 16;
  const commaIdx = style.fontFamily.indexOf(",");
  const first =
    commaIdx > -1 ? style.fontFamily.slice(0, commaIdx).trim() : style.fontFamily.trim();
  const quoted = first.startsWith("'") || first.startsWith('"') ? first : `'${first}'`;
  return (autoFont = `${px}px ${quoted}`);
}

export function register(sel: string, config: { font: string }): void {
  fiber.set(sel, config.font);
}

type PretextExtras = {
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

function extractExtras(o: TruncateOptions | MeasureOptions): PretextExtras | undefined {
  const e: PretextExtras = {};
  if (o.wordBreak !== undefined) e.wordBreak = o.wordBreak;
  if (o.letterSpacing !== undefined) e.letterSpacing = o.letterSpacing;
  if (o.whiteSpace !== undefined) e.whiteSpace = o.whiteSpace;
  return Object.keys(e).length ? e : undefined;
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

function extractFontSize(font: string): number {
  const m = font.match(/(\d+(?:\.\d+)?)\s*px/);
  return m ? parseFloat(m[1]) : 16;
}

function resolveFont(opts: { font?: string; selector?: string }): string {
  if (opts.font) return normalizeFont(opts.font);
  if (opts.selector) {
    const f = fiber.get(opts.selector);
    if (f) return normalizeFont(f);
  }
  return detectFont();
}

function getMeasureContext() {
  return typeof OffscreenCanvas !== "undefined"
    ? new OffscreenCanvas(0, 0).getContext("2d")!
    : document.createElement("canvas").getContext("2d")!;
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

function parseCssWidth(value: CssWidth, fontSize?: number, font?: string): number {
  if (typeof value === "number") return value;
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

function prep(text: string, font: string, extras?: PretextExtras) {
  return prepare(text, font, extras as Parameters<typeof prepare>[2]);
}

function prepSeg(text: string, font: string, extras?: PretextExtras) {
  return prepareWithSegments(text, font, extras as Parameters<typeof prepareWithSegments>[2]);
}

function lineCount(text: string, font: string, maxWidth: number, extras?: PretextExtras): number {
  return text ? layout(prep(text, font, extras), maxWidth, 1).lineCount : 0;
}

function toGraphemes(text: string): string[] {
  return [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
}

type ResolveCtx = {
  font: string;
  maxWidth: number;
  ellipsis: string;
  extras: PretextExtras | undefined;
  originalLineCount: number;
};

type BaseCtx = {
  font: string;
  maxWidth: number;
  extras: PretextExtras | undefined;
};

function resolveBase(options: TruncateOptions | MeasureOptions): BaseCtx {
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  return { font, maxWidth, extras };
}

function resolveOrEarly(
  text: string,
  options: TruncateOptions,
): { ctx: ResolveCtx } | { early: TruncateResult } {
  if (!text)
    return {
      early: { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } },
    };
  const { font, maxWidth, extras } = resolveBase(options);
  const ellipsis = options.ellipsis ?? "\u2026";
  if (maxWidth <= 0)
    return {
      early: { text: "", original: text, truncated: true, metrics: { originalLineCount: 0 } },
    };
  const originalLineCount = lineCount(text, font, maxWidth, extras);
  if (originalLineCount <= 1)
    return { early: { text, original: text, truncated: false, metrics: { originalLineCount } } };
  return { ctx: { font, maxWidth, ellipsis, extras, originalLineCount } };
}

function result(
  original: string,
  text: string,
  ctx: ResolveCtx,
  truncated: boolean,
): TruncateResult {
  return { text, original, truncated, metrics: { originalLineCount: ctx.originalLineCount } };
}

type CandidateFn = (graphemes: string[], total: number) => string;

function narrowGraphemes(
  graphemes: string[],
  font: string,
  maxWidth: number,
  extras: PretextExtras | undefined,
  buildCandidate: CandidateFn,
  fallback: string,
): string {
  let lo = 0;
  let hi = graphemes.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lineCount(buildCandidate(graphemes, mid), font, maxWidth, extras) <= 1) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const result = buildCandidate(graphemes, lo);
  return lineCount(result, font, maxWidth, extras) > 1 ? fallback : result;
}

export function truncateByWidth(text: string, options: TruncateOptions): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const pSeg = prepSeg(text, ctx.font, ctx.extras);
  const { lines } = layoutWithLines(pSeg, ctx.maxWidth, 1);
  const firstLine = lines[0].text;
  const candidate = firstLine + ctx.ellipsis;
  if (lineCount(candidate, ctx.font, ctx.maxWidth, ctx.extras) <= 1)
    return result(text, candidate, ctx, true);
  const graphemes = toGraphemes(firstLine);
  return result(
    text,
    narrowGraphemes(
      graphemes,
      ctx.font,
      ctx.maxWidth,
      ctx.extras,
      (gs, t) => gs.slice(0, t).join("") + ctx.ellipsis,
      ctx.ellipsis,
    ),
    ctx,
    true,
  );
}

export function truncateByLines(text: string, options: TruncateOptions): TruncateResult {
  if (!text) return { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } };
  const { font, maxWidth, extras } = resolveBase(options);
  const ellipsis = options.ellipsis ?? "\u2026";
  if (maxWidth <= 0)
    return { text: "", original: text, truncated: true, metrics: { originalLineCount: 0 } };

  if (options.keepLines) {
    const indices = [...new Set(options.keepLines.filter((n) => Number.isInteger(n) && n > 0))];
    const allLines = text.replace(/\r\n/g, "\n").split("\n");
    const originalLineCount = allLines.length;
    const selected = allLines.filter((_, i) => indices.includes(i + 1));
    if (selected.length === 0)
      return { text: "", original: text, truncated: true, metrics: { originalLineCount } };
    const truncated = selected.map((line) => {
      if (!line || lineCount(line, font, maxWidth, extras) <= 1) return line;
      const c = line + ellipsis;
      if (lineCount(c, font, maxWidth, extras) <= 1) return c;
      const gs = toGraphemes(line);
      return narrowGraphemes(
        gs,
        font,
        maxWidth,
        extras,
        (gs, t) => gs.slice(0, t).join("") + ellipsis,
        ellipsis,
      );
    });
    const anyTruncated = truncated.some((t, i) => t !== selected[i]);
    return {
      text: truncated.join("\n"),
      original: text,
      truncated: anyTruncated,
      metrics: { originalLineCount },
    };
  }

  const maxLines = options.maxLines ?? 1;
  if (maxLines <= 0)
    return { text: "", original: text, truncated: true, metrics: { originalLineCount: 0 } };
  const lh = options.lineHeight ?? 20;
  const prepared = prepSeg(text, font, extras);
  const { lines } = layoutWithLines(prepared, maxWidth, lh);
  const originalLineCount = lines.length;
  if (lines.length <= maxLines)
    return { text, original: text, truncated: false, metrics: { originalLineCount } };
  const leading = lines.slice(0, maxLines - 1);
  const prefix = leading.map((l) => l.text).join("\n");
  const lastSource = lines[maxLines - 1].text;
  const metrics = { originalLineCount };
  if (lineCount(lastSource + ellipsis, font, maxWidth, extras) <= 1) {
    const result =
      leading.length > 0 ? prefix + "\n" + lastSource + ellipsis : lastSource + ellipsis;
    return { text: result, original: text, truncated: true, metrics };
  }
  const gs = toGraphemes(lastSource);
  const narrow = narrowGraphemes(
    gs,
    font,
    maxWidth,
    extras,
    (gs, t) => gs.slice(0, t).join("") + ellipsis,
    ellipsis,
  );
  return {
    text: leading.length > 0 ? prefix + "\n" + narrow : narrow,
    original: text,
    truncated: true,
    metrics,
  };
}

export function measureHeight(text: string, options: MeasureOptions): number {
  if (!text) return 0;
  const { font, maxWidth, extras } = resolveBase(options);
  if (maxWidth <= 0) return 0;
  const lh = options.lineHeight ?? 20;
  const p = prep(text, font, extras);
  const { height } = layout(p, maxWidth, lh);
  return Math.max(height, lh);
}

export function truncateMiddle(text: string, options: TruncateOptions): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      const prefixLen = Math.ceil(total / 2);
      const suffixLen = Math.floor(total / 2);
      return gs.slice(0, prefixLen).join("") + ctx.ellipsis + gs.slice(n - suffixLen).join("");
    },
    ctx.ellipsis,
  );
  return result(text, narrow, ctx, true);
}

export function truncateStart(text: string, options: TruncateOptions): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      return ctx.ellipsis + gs.slice(n - total).join("");
    },
    ctx.ellipsis,
  );
  return result(text, narrow, ctx, true);
}

export function truncateAtOffset(
  text: string,
  options: TruncateOptions & { offset?: number },
): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  const splitPoint = Math.max(0, Math.min(n, options.offset ?? Math.floor(n / 2)));
  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      const prefixLen = Math.min(splitPoint, total);
      const suffixLen = Math.min(n - splitPoint, total - prefixLen);
      return gs.slice(0, prefixLen).join("") + ctx.ellipsis + gs.slice(n - suffixLen).join("");
    },
    ctx.ellipsis,
  );
  return result(text, narrow, ctx, true);
}

function findTargetInGraphemes(haystack: string[], needle: string[]): number {
  if (needle.length === 0 || needle.length > haystack.length) return -1;
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

export function truncateAround(
  text: string,
  options: TruncateOptions & { target?: string; context?: number; before?: number; after?: number },
): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  if (!options.target) return truncateByWidth(text, options);
  const { ctx } = r;
  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  const needle = toGraphemes(options.target);
  const targetIdx = findTargetInGraphemes(graphemes, needle);
  if (targetIdx === -1) return truncateByWidth(text, options);
  const targetEnd = targetIdx + needle.length;
  const beforeMax = targetIdx;
  const afterMax = n - targetEnd;
  const ctxBefore =
    options.before !== undefined
      ? Math.max(0, Math.min(beforeMax, options.before))
      : options.context !== undefined
        ? Math.max(0, Math.min(beforeMax, options.context))
        : null;
  const ctxAfter =
    options.after !== undefined
      ? Math.max(0, Math.min(afterMax, options.after))
      : options.context !== undefined
        ? Math.max(0, Math.min(afterMax, options.context))
        : null;
  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      const avail = total - needle.length;
      const half = Math.ceil(avail / 2);
      let before = Math.min(beforeMax, half);
      let after = Math.min(afterMax, avail - before);
      if (before + after < avail) {
        after = Math.min(afterMax, after + Math.min(beforeMax - before, avail - before - after));
      }
      if (ctxBefore !== null) before = Math.min(before, ctxBefore);
      if (ctxAfter !== null) after = Math.min(after, ctxAfter);
      const front = before < beforeMax;
      const back = after < afterMax;
      let c = "";
      if (front) c += ctx.ellipsis;
      c += gs.slice(targetIdx - before, targetEnd + after).join("");
      if (back) c += ctx.ellipsis;
      return c;
    },
    ctx.ellipsis,
  );
  return result(text, narrow, ctx, true);
}

export function truncate(text: string, options: TruncateOptions): TruncateResult {
  return options.maxLines !== undefined || options.keepLines !== undefined
    ? truncateByLines(text, options)
    : truncateByWidth(text, options);
}

export interface Truncator {
  truncateByWidth(text: string, opts?: Partial<TruncateOptions>): TruncateResult;
  truncateByLines(text: string, opts?: Partial<TruncateOptions>): TruncateResult;
  measureHeight(text: string, opts?: Partial<MeasureOptions>): number;
  truncateStart(text: string, opts?: Partial<TruncateOptions>): TruncateResult;
  truncateMiddle(text: string, opts?: Partial<TruncateOptions>): TruncateResult;
  truncateAtOffset(
    text: string,
    opts?: Partial<TruncateOptions & { offset?: number }>,
  ): TruncateResult;
  truncateAround(
    text: string,
    opts?: Partial<
      TruncateOptions & { target?: string; context?: number; before?: number; after?: number }
    >,
  ): TruncateResult;
  truncate(text: string, opts?: Partial<TruncateOptions>): TruncateResult;
}

export function createTruncator(config: Partial<TruncateOptions>): Truncator {
  const defaults: Partial<TruncateOptions> = {};
  for (const k of [
    "selector",
    "font",
    "lineHeight",
    "ellipsis",
    "wordBreak",
    "letterSpacing",
    "whiteSpace",
    "maxLines",
    "keepLines",
  ] as const) {
    if (config[k] !== undefined) (defaults as any)[k] = config[k];
  }
  const d =
    <T>(fn: (text: string, opts: T) => any) =>
    (text: string, opts?: Partial<T>) =>
      fn(text, { ...defaults, ...opts } as T);
  return {
    truncateByWidth: d(truncateByWidth),
    truncateByLines: d(truncateByLines),
    measureHeight: d(measureHeight),
    truncateStart: d(truncateStart),
    truncateMiddle: d(truncateMiddle),
    truncateAtOffset: d(truncateAtOffset),
    truncateAround: d(truncateAround),
    truncate: d(truncate),
  } as Truncator;
}

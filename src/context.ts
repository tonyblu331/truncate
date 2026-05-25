import { extractFontSize, parseCssWidth, resolveFont } from "./measurement.js";
import { extractExtras, fitsSingleLine, lineCount, type PretextExtras } from "./pretext-layout.js";
import type { MeasureOptions, TruncateOptions, TruncateResult } from "./types.js";

export type ResolveCtx = {
  font: string;
  maxWidth: number;
  ellipsis: string;
  extras: PretextExtras | undefined;
  originalLineCount: number;
};

export type BaseCtx = {
  font: string;
  maxWidth: number;
  extras: PretextExtras | undefined;
};

export function resolveBase(options: TruncateOptions | MeasureOptions): BaseCtx {
  const extras = extractExtras(options);
  const font = resolveFont(options);
  const maxWidth = parseCssWidth(options.maxWidth, extractFontSize(font), font);
  return { font, maxWidth, extras };
}

export function resolveOrEarly(
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
  if (originalLineCount <= 1 && fitsSingleLine(text, font, maxWidth, extras))
    return { early: { text, original: text, truncated: false, metrics: { originalLineCount } } };
  return { ctx: { font, maxWidth, ellipsis, extras, originalLineCount } };
}

export function result(
  original: string,
  text: string,
  ctx: ResolveCtx,
  truncated: boolean,
): TruncateResult {
  return { text, original, truncated, metrics: { originalLineCount: ctx.originalLineCount } };
}

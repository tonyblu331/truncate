import { layout, measureLineStats, prepare, prepareWithSegments } from "@chenglou/pretext";
import type { MeasureOptions, TruncateOptions, WhiteSpaceMode, WordBreakMode } from "./types.js";

export type PretextExtras = {
  wordBreak?: WordBreakMode;
  letterSpacing?: number;
  whiteSpace?: WhiteSpaceMode;
};

export function extractExtras(o: TruncateOptions | MeasureOptions): PretextExtras | undefined {
  const e: PretextExtras = {};
  if (o.wordBreak !== undefined) e.wordBreak = o.wordBreak;
  if (o.letterSpacing !== undefined) e.letterSpacing = o.letterSpacing;
  if (o.whiteSpace !== undefined) e.whiteSpace = o.whiteSpace;
  return Object.keys(e).length ? e : undefined;
}

export function prep(text: string, font: string, extras?: PretextExtras) {
  return prepare(text, font, extras as Parameters<typeof prepare>[2]);
}

export function prepSeg(text: string, font: string, extras?: PretextExtras) {
  return prepareWithSegments(text, font, extras as Parameters<typeof prepareWithSegments>[2]);
}

export function lineCount(
  text: string,
  font: string,
  maxWidth: number,
  extras?: PretextExtras,
): number {
  return text ? layout(prep(text, font, extras), maxWidth, 1).lineCount : 0;
}

export function fitsSingleLine(
  text: string,
  font: string,
  maxWidth: number,
  extras?: PretextExtras,
): boolean {
  if (!text) return true;
  const stats = measureLineStats(prepSeg(text, font, extras), maxWidth);
  return stats.lineCount <= 1 && stats.maxLineWidth <= maxWidth;
}

type CandidateFn = (graphemes: string[], total: number) => string;

export function narrowGraphemes(
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
    if (fitsSingleLine(buildCandidate(graphemes, mid), font, maxWidth, extras)) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const result = buildCandidate(graphemes, lo);
  return fitsSingleLine(result, font, maxWidth, extras)
    ? result
    : fitsSingleLine(fallback, font, maxWidth, extras)
      ? fallback
      : "";
}

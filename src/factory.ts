import { measureHeight, truncateByLines } from "./lines.js";
import { truncateAround, truncateAtOffset, truncateRange } from "./range.js";
import type { MeasureOptions, TruncateOptions, TruncateResult } from "./types.js";
import { truncateByWidth, truncateMiddle, truncateStart } from "./width.js";

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
  truncateRange(
    text: string,
    opts?: Partial<TruncateOptions & { start?: number; end?: number }>,
  ): TruncateResult;
  truncateAround(
    text: string,
    opts?: Partial<
      TruncateOptions & { target?: string; context?: number; before?: number; after?: number }
    >,
  ): TruncateResult;
  truncate(text: string, opts?: Partial<TruncateOptions>): TruncateResult;
}

function truncateDefault(text: string, options: TruncateOptions): TruncateResult {
  return options.maxLines !== undefined || options.keepLines !== undefined
    ? truncateByLines(text, options)
    : truncateByWidth(text, options);
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
    truncateRange: d(truncateRange),
    truncateAround: d(truncateAround),
    truncate: d(truncateDefault),
  } as Truncator;
}

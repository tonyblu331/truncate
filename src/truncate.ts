import { truncateByLines } from "./lines.js";
import type { TruncateOptions, TruncateResult } from "./types.js";
import { truncateByWidth } from "./width.js";

export { detectFont, register } from "./measurement.js";
export type {
  CssWidth,
  MeasureOptions,
  TruncateOptions,
  TruncateResult,
  WhiteSpaceMode,
  WordBreakMode,
} from "./types.js";
export { createTruncator, type Truncator } from "./factory.js";
export { measureHeight, truncateByLines } from "./lines.js";
export { truncateAround, truncateAtOffset, truncateRange } from "./range.js";
export { truncateByWidth, truncateMiddle, truncateStart } from "./width.js";

export function truncate(text: string, options: TruncateOptions): TruncateResult {
  return options.maxLines !== undefined || options.keepLines !== undefined
    ? truncateByLines(text, options)
    : truncateByWidth(text, options);
}

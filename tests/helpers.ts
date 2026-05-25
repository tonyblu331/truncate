import * as packageApi from "@tonybonet/truncate";
export { packageApi };
export {
  createTruncator,
  measureHeight,
  truncate,
  truncateAround,
  truncateAtOffset,
  truncateByLines,
  truncateByWidth,
  truncateMiddle,
  truncateRange,
  truncateStart,
} from "../src/index.ts";

export const TEXT = [
  "First line of the text",
  "Second line with more content",
  "Third line here",
  "Fourth line that is somewhat longer content",
  "Fifth line of the text",
];

export const FONT = "16px sans-serif";
export const WIDE = 500;
export const NARROW = 50;
export const LONG =
  "A very long string that should not fit in fifty pixels at a large font size indeed";
export const PARA = "word word word word word word word word word word word word word word";

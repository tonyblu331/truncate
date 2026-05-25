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
  metrics: { originalLineCount: number; rangePreserved?: boolean };
}

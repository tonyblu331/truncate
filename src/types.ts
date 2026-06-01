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

export type DOMCompatibleStyle = Record<string, string | undefined>;

export interface DOMNativeElementLike {
  readonly nodeType: number;
  textContent: string | null;
  readonly clientWidth: number;
  getBoundingClientRect: () => { width?: number };
}

type DOMCompatibleBox =
  | {
      readonly clientWidth: number;
      getBoundingClientRect?: () => { width?: number };
    }
  | {
      readonly clientWidth?: number;
      getBoundingClientRect: () => { width?: number };
    };

export type DOMCompatibleAdapter = {
  readonly nodeType: 1;
  textContent: string | null;
  readonly computedStyle?: DOMCompatibleStyle;
} & DOMCompatibleBox;

export type DOMCompatibleElement = DOMNativeElementLike | DOMCompatibleAdapter;

export interface BoundTruncator {
  truncate(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateByWidth(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateByLines(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateMiddle(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateStart(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateAtOffset(opts?: Partial<TruncateOptions & { offset?: number }>): TruncateResult;
  truncateRange(opts?: Partial<TruncateOptions & { start?: number; end?: number }>): TruncateResult;
  truncateAround(
    opts?: Partial<
      TruncateOptions & { target?: string; context?: number; before?: number; after?: number }
    >,
  ): TruncateResult;
  measureHeight(opts?: Partial<MeasureOptions>): number;
}

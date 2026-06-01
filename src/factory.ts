import { isElement, inferFromElement, readText, writeText } from "./element.js";
import { measureHeight, truncateByLines } from "./lines.js";
import { truncateAround, truncateAtOffset, truncateRange } from "./range.js";
import type {
  BoundTruncator,
  DOMCompatibleElement,
  MeasureOptions,
  TruncateOptions,
  TruncateResult,
} from "./types.js";
import { truncateByWidth, truncateMiddle, truncateStart } from "./width.js";

export type { BoundTruncator, DOMCompatibleAdapter, DOMCompatibleElement } from "./types.js";

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

type TextOperation<Options> = (text: string, opts: Options) => TruncateResult;

const defaultKeys = [
  "selector",
  "font",
  "lineHeight",
  "ellipsis",
  "wordBreak",
  "letterSpacing",
  "whiteSpace",
  "maxLines",
  "keepLines",
] as const satisfies readonly (keyof TruncateOptions)[];

function truncateDefault(text: string, options: TruncateOptions): TruncateResult {
  return options.maxLines !== undefined || options.keepLines !== undefined
    ? truncateByLines(text, options)
    : truncateByWidth(text, options);
}

function createConfigTruncator(config: Partial<TruncateOptions>): Truncator {
  const defaults = defaultKeys.reduce<Partial<TruncateOptions>>(
    (picked, key) => (config[key] === undefined ? picked : { ...picked, [key]: config[key] }),
    {},
  );
  const d =
    <Options, Return>(fn: (text: string, opts: Options) => Return) =>
    (text: string, opts?: Partial<Options>): Return =>
      fn(text, { ...defaults, ...opts } as Options);
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

function wrapResult(element: DOMCompatibleElement, result: TruncateResult): TruncateResult {
  writeText(element, result.text);
  return result;
}

function createBoundTruncator(element: DOMCompatibleElement): BoundTruncator {
  const defaults = inferFromElement(element);
  let sourceText = readText(element);
  let lastWritten: string | undefined;

  const readSourceText = () => {
    const current = readText(element);
    if (current !== lastWritten) sourceText = current;
    return sourceText;
  };

  const writeResult = (result: TruncateResult) => {
    lastWritten = result.text;
    return wrapResult(element, result);
  };

  const run = <Options extends TruncateOptions>(
    fn: TextOperation<Options>,
    opts?: Partial<Options>,
  ) => writeResult(fn(readSourceText(), { ...defaults, ...opts } as Options));

  return {
    truncate: (opts?) => {
      const merged = { ...defaults, ...opts } as TruncateOptions;
      return writeResult(truncateDefault(readSourceText(), merged));
    },
    truncateByWidth: (opts?) => run(truncateByWidth, opts),
    truncateByLines: (opts?) => run(truncateByLines, opts),
    truncateMiddle: (opts?) => run(truncateMiddle, opts),
    truncateStart: (opts?) => run(truncateStart, opts),
    truncateAtOffset: (opts?) => run(truncateAtOffset, opts),
    truncateRange: (opts?) => run(truncateRange, opts),
    truncateAround: (opts?) => run(truncateAround, opts),
    measureHeight: (opts?) => {
      const merged = { ...defaults, ...opts } as MeasureOptions;
      return measureHeight(readSourceText(), merged);
    },
  };
}

export function createTruncator(config: Partial<TruncateOptions>): Truncator;
export function createTruncator(element: DOMCompatibleElement): BoundTruncator;
export function createTruncator(
  arg: Partial<TruncateOptions> | DOMCompatibleElement,
): Truncator | BoundTruncator {
  return isElement(arg) ? createBoundTruncator(arg) : createConfigTruncator(arg);
}

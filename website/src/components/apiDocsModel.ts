type ParamRow = {
  name: string;
  type: string;
  description: string;
};

export type ApiFunctionDoc = {
  id: string;
  title: string;
  badge?: string;
  description: string;
  signature: string;
  params?: ParamRow[];
  returns: string;
  example?: string;
};

export type ApiTypeDoc = {
  id: string;
  title: string;
  signature: string;
  description?: string;
};

export type ApiRecipeDoc = {
  id: string;
  title: string;
  description: string;
  example: string;
};

export const recipeDocs: ApiRecipeDoc[] = [
  {
    id: "recipe-preserve-target",
    title: "Preserve a match in long text",
    description:
      "Use `truncateAround` for search results, support notes, logs, table cells, and previews where the meaningful match is buried in the middle.",
    example: `truncateAround(supportNote, {\n  font: "14px Geist Mono",\n  maxWidth: 240,\n  target: "invoice #1042",\n  context: 10,\n})`,
  },
  {
    id: "recipe-preserve-range",
    title: "Preserve known offsets",
    description:
      "Use `truncateRange` when your search/indexing layer already returns grapheme offsets.",
    example: `truncateRange(article, {\n  font: "16px Inter",\n  maxWidth: "40ch",\n  start: match.start,\n  end: match.end,\n  before: 12,\n  after: 12,\n})`,
  },
  {
    id: "recipe-css-width",
    title: "Use CSS-like widths",
    description:
      "`maxWidth` accepts numbers, bare pixel strings, and common CSS units like `rem`, `em`, `ch`, `vw`, `vh`, `vmin`, and `vmax`.",
    example: `truncateByWidth(title, {\n  font: "16px Inter",\n  maxWidth: "32ch",\n})`,
  },
  {
    id: "recipe-factory",
    title: "Pre-bind repeated options",
    description:
      "Use `createTruncator` when a component family shares font, line height, ellipsis, or Pretext options.",
    example: `const bodyText = createTruncator({\n  font: "16px Inter",\n  lineHeight: 24,\n})\n\nbodyText.truncateByLines(summary, {\n  maxWidth: 360,\n  maxLines: 3,\n})`,
  },
];

export const functionDocs: ApiFunctionDoc[] = [
  {
    id: "fn-truncate",
    title: "truncate",
    badge: "recommended",
    description:
      "Single entry point. Uses line truncation when `maxLines` or `keepLines` is present; otherwise uses width truncation.",
    signature: "truncate(text: string, options: TruncateOptions): TruncateResult",
    returns: "TruncateResult",
    example: `truncate("A very long string", { font: "16px Inter", maxWidth: 100 })`,
  },
  {
    id: "fn-truncateByWidth",
    title: "truncateByWidth",
    description:
      "Single-line width truncation. Uses measured line width, not only wrap count, so narrow containers return a fitting result.",
    signature: "truncateByWidth(text: string, options: TruncateOptions): TruncateResult",
    params: [
      {
        name: "options.maxWidth",
        type: "CssWidth",
        description: "Maximum width in px or supported CSS unit",
      },
      {
        name: "options.ellipsis",
        type: "string",
        description: "Suffix appended on truncation. Default: `…`",
      },
      { name: "options.font", type: "string", description: "Canvas-compatible CSS font shorthand" },
      { name: "options.wordBreak", type: "WordBreakMode", description: "`normal` or `keep-all`" },
      {
        name: "options.letterSpacing",
        type: "number",
        description: "CSS letter-spacing in pixels",
      },
      { name: "options.whiteSpace", type: "WhiteSpaceMode", description: "`normal` or `pre-wrap`" },
    ],
    returns: "TruncateResult",
    example: `truncateByWidth("The quick brown fox", {\n  font: "16px Inter",\n  maxWidth: 120,\n})`,
  },
  {
    id: "fn-truncateByLines",
    title: "truncateByLines",
    description:
      "Multi-line truncation. Preserves visible leading lines and truncates the last visible line when content exceeds `maxLines`.",
    signature: "truncateByLines(text: string, options: TruncateOptions): TruncateResult",
    params: [
      {
        name: "options.maxWidth",
        type: "CssWidth",
        description: "Container width in px or supported CSS unit",
      },
      {
        name: "options.maxLines",
        type: "number",
        description: "Maximum visible lines. Fractional values are truncated",
      },
      {
        name: "options.keepLines",
        type: "number[]",
        description: "1-indexed source lines to select and fit",
      },
      {
        name: "options.lineHeight",
        type: "number",
        description: "Line height in pixels. Default: `20`",
      },
    ],
    returns: "TruncateResult",
    example: `truncateByLines(longArticle, {\n  font: "16px Inter",\n  maxWidth: 320,\n  maxLines: 3,\n})`,
  },
  {
    id: "fn-truncateMiddle",
    title: "truncateMiddle",
    description: "Keeps the start and end visible while truncating through the middle.",
    signature: "truncateMiddle(text: string, options: TruncateOptions): TruncateResult",
    returns: "TruncateResult",
    example: `truncateMiddle("user@example.com", { font: "14px mono", maxWidth: 80 })`,
  },
  {
    id: "fn-truncateStart",
    title: "truncateStart",
    description: "Keeps the suffix visible and truncates from the start.",
    signature: "truncateStart(text: string, options: TruncateOptions): TruncateResult",
    returns: "TruncateResult",
    example: `truncateStart("a3f2c8b1e9d04a7f", { font: "13px Geist Mono", maxWidth: 80 })`,
  },
  {
    id: "fn-truncateAtOffset",
    title: "truncateAtOffset",
    description:
      "Anchors truncation around a grapheme offset. Negative offsets are resolved from the end. Missing offset falls back to width truncation.",
    signature:
      "truncateAtOffset(text: string, options: TruncateOptions & { offset?: number }): TruncateResult",
    params: [
      { name: "options.offset", type: "number", description: "Grapheme index to anchor around" },
    ],
    returns: "TruncateResult",
    example: `truncateAtOffset(longText, {\n  font: "16px Inter",\n  maxWidth: 200,\n  offset: 42,\n})`,
  },
  {
    id: "fn-truncateAround",
    title: "truncateAround",
    description:
      "Keeps the first matching target string visible. Use `context`, `before`, and `after` to cap surrounding graphemes.",
    signature:
      "truncateAround(text: string, options: TruncateOptions & { target?: string; context?: number; before?: number; after?: number }): TruncateResult",
    params: [
      { name: "options.target", type: "string", description: "Substring to keep visible" },
      { name: "options.context", type: "number", description: "Maximum graphemes on each side" },
      {
        name: "options.before / after",
        type: "number",
        description: "Side-specific grapheme limits",
      },
    ],
    returns: "TruncateResult",
    example: `const result = truncateAround(supportNote, {\n  font: "16px Inter",\n  maxWidth: 300,\n  target: "invoice #1042",\n  context: 8,\n})\n\nresult.metrics.rangePreserved`,
  },
  {
    id: "fn-truncateRange",
    title: "truncateRange",
    description:
      "Keeps an explicit grapheme range visible. Use this when the caller already knows the slice that matters.",
    signature:
      "truncateRange(text: string, options: TruncateOptions & { start?: number; end?: number; context?: number; before?: number; after?: number }): TruncateResult",
    params: [
      { name: "options.start", type: "number", description: "Start grapheme index" },
      { name: "options.end", type: "number", description: "End grapheme index" },
      { name: "options.context", type: "number", description: "Maximum graphemes on each side" },
    ],
    returns: "TruncateResult",
    example: `truncateRange(longArticle, {\n  font: "16px Inter",\n  maxWidth: 300,\n  start: 120,\n  end: 132,\n})`,
  },
  {
    id: "fn-measureHeight",
    title: "measureHeight",
    description: "Measures paragraph height for a width and line height without DOM layout reads.",
    signature: "measureHeight(text: string, options: MeasureOptions): number",
    params: [
      { name: "options.maxWidth", type: "CssWidth", description: "Container width" },
      { name: "options.lineHeight", type: "number", description: "Line height in pixels" },
    ],
    returns: "number",
    example: `measureHeight("Hello\\nworld", {\n  font: "16px Inter",\n  maxWidth: 320,\n  lineHeight: 22,\n})`,
  },
  {
    id: "fn-createTruncator",
    title: "createTruncator",
    badge: "factory",
    description: "Pre-binds shared options for repeated truncation calls.",
    signature: "createTruncator(config: Partial<TruncateOptions>): Truncator",
    returns: "Truncator",
    example: `const t = createTruncator({ font: "16px Inter", lineHeight: 22 })\nt.truncateByLines(longArticle, { maxWidth: 320, maxLines: 3 })`,
  },
  {
    id: "fn-detectFont",
    title: "detectFont",
    description:
      "Detects a Canvas font shorthand from `document.body`. Use explicit fonts for SSR or workers.",
    signature: "detectFont(): string",
    returns: "string",
    example: `import { detectFont } from "@tonybonet/truncate"\ndetectFont()`,
  },
  {
    id: "fn-register",
    title: "register",
    description: "Registers a selector name to a font shorthand for `selector`-based calls.",
    signature: "register(selector: string, config: { font: string }): void",
    returns: "void",
    example: `register("body", { font: "18px Geist" })`,
  },
];

export const typeDocs: ApiTypeDoc[] = [
  {
    id: "type-TruncateResult",
    title: "TruncateResult",
    signature:
      "interface TruncateResult {\n  text: string\n  original: string\n  truncated: boolean\n  metrics: { originalLineCount: number; rangePreserved?: boolean }\n}",
  },
  {
    id: "type-TruncateOptions",
    title: "TruncateOptions",
    signature:
      "interface TruncateOptions {\n  font?: string\n  selector?: string\n  maxWidth: CssWidth\n  ellipsis?: string\n  maxLines?: number\n  keepLines?: number[]\n  lineHeight?: number\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n  context?: number\n  before?: number\n  after?: number\n}",
  },
  {
    id: "type-MeasureOptions",
    title: "MeasureOptions",
    signature:
      "interface MeasureOptions {\n  font?: string\n  selector?: string\n  maxWidth: CssWidth\n  lineHeight: number\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n}",
  },
  {
    id: "type-Truncator",
    title: "Truncator",
    signature:
      "interface Truncator {\n  truncateByWidth(text: string, opts?: Partial<TruncateOptions>): TruncateResult\n  truncateByLines(text: string, opts?: Partial<TruncateOptions>): TruncateResult\n  truncateStart(text: string, opts?: Partial<TruncateOptions>): TruncateResult\n  truncateMiddle(text: string, opts?: Partial<TruncateOptions>): TruncateResult\n  truncateAtOffset(text: string, opts?: Partial<TruncateOptions & { offset?: number }>): TruncateResult\n  truncateRange(text: string, opts?: Partial<TruncateOptions & { start?: number; end?: number; context?: number; before?: number; after?: number }>): TruncateResult\n  truncateAround(text: string, opts?: Partial<TruncateOptions & { target?: string; context?: number; before?: number; after?: number }>): TruncateResult\n  measureHeight(text: string, opts?: Partial<MeasureOptions>): number\n}",
  },
  { id: "type-CssWidth", title: "CssWidth", signature: "type CssWidth = number | string" },
  {
    id: "type-WordBreakMode",
    title: "WordBreakMode",
    signature: 'type WordBreakMode = "normal" | "keep-all"',
  },
  {
    id: "type-WhiteSpaceMode",
    title: "WhiteSpaceMode",
    signature: 'type WhiteSpaceMode = "normal" | "pre-wrap"',
  },
];

export const optionRows = [
  ["font", "string", "auto-detect", "All measurement APIs"],
  ["selector", "string", "—", "Font lookup"],
  ["maxWidth", "CssWidth", "required", "All truncation and measurement APIs"],
  ["lineHeight", "number", "20 for line truncation", "Lines and height"],
  ["maxLines", "number", "1", "truncateByLines"],
  ["keepLines", "number[]", "—", "truncateByLines"],
  ["ellipsis", "string", "…", "Truncation APIs"],
  ["wordBreak", "WordBreakMode", "normal", "Passed to Pretext"],
  ["letterSpacing", "number", "—", "Passed to Pretext"],
  ["whiteSpace", "WhiteSpaceMode", "normal", "Passed to Pretext"],
  ["target", "string", "—", "truncateAround"],
  ["start / end", "number", "—", "truncateRange"],
  ["offset", "number", "—", "truncateAtOffset"],
  ["context / before / after", "number", "—", "Range and target APIs"],
] as const;

export const cssWidthRows = [
  ["px", "literal value", "Default when unit is omitted"],
  ["rem", "value x root font-size", "Uses document.documentElement"],
  ["em", "value x resolved font size", "Uses the provided font"],
  ["ch", "value x width of 0", "Requires font context"],
  ["vw", "value% of viewport width", "Uses window.innerWidth"],
  ["vh", "value% of viewport height", "Uses window.innerHeight"],
  ["vmin", "value% of min(vw, vh)", ""],
  ["vmax", "value% of max(vw, vh)", ""],
] as const;

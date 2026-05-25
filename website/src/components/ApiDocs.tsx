import { type ReactNode } from "react";

function T({
  as: Tag = "span",
  mono = false,
  dim = false,
  size = "m",
  className = "",
  children,
}: {
  as?: "p" | "span" | "div" | "label" | "h1" | "h2" | "h3" | "h4";
  mono?: boolean;
  dim?: boolean;
  size?: "s" | "m" | "l";
  className?: string;
  children: ReactNode;
}) {
  const sz = { s: "text-s", m: "text-m", l: "text-l" };
  return (
    <Tag
      className={`${sz[size]} ${dim ? "text-base/45" : "text-base"} ${mono ? "font-mono" : "font-sans"} ${className}`}
    >
      {children}
    </Tag>
  );
}

function Hr() {
  return <div className="my-8 border-t border-base/15" />;
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs px-1.5 py-0.5 ring-1 ring-base/15 text-base/65 uppercase tracking-wider">
      {children}
    </span>
  );
}

function Signature({ children }: { children: string }) {
  return (
    <pre className="font-mono text-s leading-relaxed ring-1 ring-base/15 p-4 overflow-x-auto mb-4">
      <code>{children}</code>
    </pre>
  );
}

function ApiSection({
  id,
  title,
  badge,
  children,
}: {
  id?: string;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-12">
      <div className="flex items-center gap-3 mb-1">
        <T as="h3" size="l" mono className="leading-heading">
          {title}
        </T>
        {badge && <Badge>{badge}</Badge>}
      </div>
      {children}
    </section>
  );
}

function Desc({ children }: { children: ReactNode }) {
  return (
    <T as="p" size="m" dim className="leading-body mb-4">
      {children}
    </T>
  );
}

function ParamsTable({ cols, rows }: { cols: string[]; rows: Record<string, string>[] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full font-mono text-s ring-1 ring-base/15 border-collapse">
        <thead>
          <tr className="ring-0 ring-b-base/15 ring-b-1">
            {cols.map((c) => (
              <th
                key={c}
                className="text-left px-3 py-2 text-base/45 uppercase tracking-wider font-normal"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="ring-0 ring-b-base/10 ring-b-1 last:ring-b-0">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 align-top text-base leading-body">
                  {row[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RetType({ type }: { type: string }) {
  return (
    <div className="flex items-start gap-2 mb-4">
      <Badge>returns</Badge>
      <span className="font-mono text-s text-base">{type}</span>
    </div>
  );
}

function Example({ code }: { code: string }) {
  return (
    <div>
      <T as="p" size="s" mono dim className="mb-1 uppercase tracking-wider">
        Example
      </T>
      <pre className="font-mono text-s leading-relaxed ring-1 ring-base/15 p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <div>
      <div className="mb-10">
        <T as="h2" size="l" className="mb-1 leading-heading">
          API Reference
        </T>
        <T as="p" size="m" dim className="leading-body">
          Complete type signatures, options, and examples for every export.
        </T>
      </div>

      {/* ── Functions ── */}
      <div className="mb-4">
        <T
          as="h2"
          size="l"
          mono
          className="leading-heading ring-0 ring-b-base/15 ring-b-1 pb-1 mb-6"
        >
          Functions
        </T>
      </div>

      <ApiSection id="fn-truncate" title="truncate" badge="recommended">
        <Desc>
          Single entry point. Auto-detects the truncation strategy based on options: if{" "}
          <code className="font-mono">maxLines</code> is present, delegates to{" "}
          <code className="font-mono">truncateByLines</code>; otherwise to{" "}
          <code className="font-mono">truncateByWidth</code>.
        </Desc>
        <Signature>{`truncate(text: string, options: TruncateOptions): TruncateResult`}</Signature>
        <RetType type="TruncateResult" />
        <Example
          code={`truncate("A very long string", { font: "16px Inter", maxWidth: 100 })\n// "A very lo…"`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-truncateByWidth" title="truncateByWidth">
        <Desc>
          Explicit single-line width truncation. Binary-searches the longest grapheme prefix that
          fits within <code className="font-mono">maxWidth</code> when appended with the ellipsis.
        </Desc>
        <Signature>{`truncateByWidth(text: string, options: TruncateOptions): TruncateResult`}</Signature>
        <ParamsTable
          cols={["Param", "Type", "Description"]}
          rows={[
            { Param: "text", Type: "string", Description: "Source text to truncate" },
            {
              Param: "options.maxWidth",
              Type: "CssWidth",
              Description: "Maximum width in px (or CSS unit)",
            },
            {
              Param: "options.ellipsis",
              Type: "string",
              Description: "Suffix appended on truncation. Default —",
            },
            {
              Param: "options.font",
              Type: "string",
              Description: "CSS font shorthand, e.g. 'bold 16px Inter'",
            },
            {
              Param: "options.wordBreak",
              Type: "WordBreakMode",
              Description: "'normal' | 'keep-all'",
            },
            {
              Param: "options.letterSpacing",
              Type: "number",
              Description: "CSS letter-spacing in px",
            },
            {
              Param: "options.whiteSpace",
              Type: "WhiteSpaceMode",
              Description: "'normal' | 'pre-wrap'",
            },
            {
              Param: "options.selector",
              Type: "string",
              Description: "Registered selector for font resolution",
            },
          ]}
        />
        <RetType type="TruncateResult" />
        <Example
          code={`truncateByWidth("The quick brown fox", {\n  font: "16px Inter",\n  maxWidth: 120,\n  ellipsis: "…",\n})`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-truncateByLines" title="truncateByLines">
        <Desc>
          Multi-line truncation. Preserves full lines above the limit and truncates only the last
          visible line. Requires both <code className="font-mono">maxWidth</code> and{" "}
          <code className="font-mono">lineHeight</code>.
        </Desc>
        <Signature>{`truncateByLines(text: string, options: TruncateOptions): TruncateResult`}</Signature>
        <ParamsTable
          cols={["Param", "Type", "Description"]}
          rows={[
            {
              Param: "options.maxWidth",
              Type: "CssWidth",
              Description: "Container width in px (or CSS unit)",
            },
            { Param: "options.maxLines", Type: "number", Description: "Maximum visible lines" },
            {
              Param: "options.lineHeight",
              Type: "number",
              Description: "Line height in px (default: 20)",
            },
            {
              Param: "options.ellipsis",
              Type: "string",
              Description: "Suffix on the last truncated line",
            },
            { Param: "options.font", Type: "string", Description: "CSS font shorthand" },
            {
              Param: "options.wordBreak",
              Type: "WordBreakMode",
              Description: "'normal' | 'keep-all'",
            },
            {
              Param: "options.letterSpacing",
              Type: "number",
              Description: "CSS letter-spacing in px",
            },
            {
              Param: "options.whiteSpace",
              Type: "WhiteSpaceMode",
              Description: "'normal' | 'pre-wrap'",
            },
          ]}
        />
        <RetType type="TruncateResult" />
        <Example
          code={`truncateByLines(longArticle, {\n  font: "16px Inter",\n  maxWidth: 320,\n  maxLines: 3,\n  lineHeight: 22,\n})`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-truncateMiddle" title="truncateMiddle">
        <Desc>
          Truncate from the middle, keeping the start and end visible. Ideal for emails, file paths,
          and any content where both boundaries carry meaning.
        </Desc>
        <Signature>{`truncateMiddle(text: string, options: TruncateOptions): TruncateResult`}</Signature>
        <RetType type="TruncateResult" />
        <Example
          code={`truncateMiddle("user@example.com", {\n  font: "14px mono",\n  maxWidth: 80,\n})\n// "user…com"`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-truncateStart" title="truncateStart">
        <Desc>
          Truncate from the start, keeping the suffix visible. Useful for commit SHAs, hex hashes,
          and IDs where the tail is what distinguishes them.
        </Desc>
        <Signature>{`truncateStart(text: string, options: TruncateOptions): TruncateResult`}</Signature>
        <RetType type="TruncateResult" />
        <Example
          code={`truncateStart("a3f2c8b1e9d04a7f", {\n  font: "13px Geist Mono",\n  maxWidth: 80,\n  ellipsis: "…",\n})\n// "…d04a7f"`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-truncateAtOffset" title="truncateAtOffset">
        <Desc>
          Truncate around a character offset. Splits the text at the given grapheme index and shows
          content on both sides. Falls back to <code className="font-mono">truncateMiddle</code>{" "}
          when no offset is given.
        </Desc>
        <Signature>{`truncateAtOffset(text: string, options: TruncateOptions & { offset?: number }): TruncateResult`}</Signature>
        <ParamsTable
          cols={["Param", "Type", "Description"]}
          rows={[
            {
              Param: "options.offset",
              Type: "number",
              Description: "Grapheme index to center the visible window around",
            },
          ]}
        />
        <RetType type="TruncateResult" />
        <Example
          code={`truncateAtOffset(longText, {\n  font: "16px Inter",\n  maxWidth: 200,\n  offset: 42,\n})`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-truncateAround" title="truncateAround">
        <Desc>
          Truncate keeping a specific <code className="font-mono">target</code> string visible. The
          target is searched in the source text, and surrounding context is preserved as space
          allows. Falls back to <code className="font-mono">truncateByWidth</code> if the target is
          not found.
        </Desc>
        <Signature>{`truncateAround(text: string, options: TruncateOptions & { target?: string }): TruncateResult`}</Signature>
        <ParamsTable
          cols={["Param", "Type", "Description"]}
          rows={[
            {
              Param: "options.target",
              Type: "string",
              Description: "Substring to keep visible in the result",
            },
          ]}
        />
        <RetType type="TruncateResult" />
        <Example
          code={`truncateAround(longArticle, {\n  font: "16px Inter",\n  maxWidth: 300,\n  target: "important",\n})`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-measureHeight" title="measureHeight">
        <Desc>
          Measure how many pixels a block of text occupies at a given width and line height —
          without rendering it to the DOM. Useful for sizing containers before layout.
        </Desc>
        <Signature>{`measureHeight(text: string, options: MeasureOptions): number`}</Signature>
        <ParamsTable
          cols={["Param", "Type", "Description"]}
          rows={[
            {
              Param: "options.maxWidth",
              Type: "CssWidth",
              Description: "Container width in px (or CSS unit)",
            },
            { Param: "options.lineHeight", Type: "number", Description: "Line height in px" },
            { Param: "options.font", Type: "string", Description: "CSS font shorthand" },
            {
              Param: "options.wordBreak",
              Type: "WordBreakMode",
              Description: "'normal' | 'keep-all'",
            },
            {
              Param: "options.letterSpacing",
              Type: "number",
              Description: "CSS letter-spacing in px",
            },
            {
              Param: "options.whiteSpace",
              Type: "WhiteSpaceMode",
              Description: "'normal' | 'pre-wrap'",
            },
          ]}
        />
        <RetType type="number — total height in pixels" />
        <Example
          code={`measureHeight("Hello\\nworld", {\n  font: "16px Inter",\n  maxWidth: 320,\n  lineHeight: 22,\n})\n// 44`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-createTruncator" title="createTruncator" badge="recommended">
        <Desc>
          Creates a <code className="font-mono">Truncator</code> instance with a pre-configured font
          (and optional defaults). Every method on the returned object has{" "}
          <code className="font-mono">font</code> pre-bound, so you only pass what varies per call.
          Per-call options override the config.
        </Desc>
        <Signature>{`createTruncator(config: TruncatorConfig): Truncator`}</Signature>
        <ParamsTable
          cols={["Config", "Type", "Description"]}
          rows={[
            { Config: "font", Type: "string", Description: "CSS font shorthand" },
            {
              Config: "selector",
              Type: "string",
              Description: "Registered selector for font resolution",
            },
            { Config: "lineHeight", Type: "number", Description: "Default line height" },
            { Config: "ellipsis", Type: "string", Description: "Default ellipsis string" },
            { Config: "wordBreak", Type: "WordBreakMode", Description: "'normal' | 'keep-all'" },
            { Config: "letterSpacing", Type: "number", Description: "Default letter spacing" },
            { Config: "whiteSpace", Type: "WhiteSpaceMode", Description: "'normal' | 'pre-wrap'" },
          ]}
        />
        <RetType type="Truncator" />
        <Example
          code={`const t = createTruncator({ font: "16px Inter", lineHeight: 22 })\n\nt.truncateByWidth("Hello", { maxWidth: 200 })\nt.truncateByLines(longArticle, { maxWidth: 320, maxLines: 3 })\nt.measureHeight("Hello\\nworld", { maxWidth: 320 })\n\n// Per-call override\nt.truncateByWidth("Bold", { font: "bold 24px Inter", maxWidth: 200 })`}
        />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-detectFont" title="detectFont">
        <Desc>
          Auto-detect the computed font of <code className="font-mono">document.body</code> and
          cache it. Call once at boot so all subsequent calls resolve the font automatically. Throws
          if called outside a browser.
        </Desc>
        <Signature>{`detectFont(): string`}</Signature>
        <RetType type={"string \u2014 e.g. '18px \"Geist\"'"} />
        <Example code={`import { detectFont } from "truncate"\ndetectFont()\n// "18px 'Geist'"`} />
      </ApiSection>

      <Hr />

      <ApiSection id="fn-register" title="register">
        <Desc>
          Register a font for a CSS selector. When you pass{" "}
          <code className="font-mono">selector</code> in options, the library resolves the font from
          the registry. Useful when different elements use different fonts.
        </Desc>
        <Signature>{`register(selector: string, config: { font: string }): void`}</Signature>
        <ParamsTable
          cols={["Param", "Type", "Description"]}
          rows={[
            {
              Param: "selector",
              Type: "string",
              Description: "CSS selector, e.g. 'body', 'h1', 'code'",
            },
            {
              Param: "config.font",
              Type: "string",
              Description: "CSS font shorthand to associate with the selector",
            },
          ]}
        />
        <RetType type="void" />
        <Example
          code={`register("body", { font: "18px Geist" })\nregister("h1", { font: "26px Geist" })\nregister("code", { font: "13px Geist Mono" })\n\ntruncateByWidth(text, { selector: "h1", maxWidth: 200 })`}
        />
      </ApiSection>

      {/* ── Types ── */}
      <Hr />
      <div className="mb-4">
        <T
          as="h2"
          size="l"
          mono
          className="leading-heading ring-0 ring-b-base/15 ring-b-1 pb-1 mb-6"
        >
          Types
        </T>
      </div>

      <ApiSection id="type-TruncateResult" title="TruncateResult">
        <Signature>{`interface TruncateResult {\n  text: string\n  original: string\n  truncated: boolean\n  metrics: TruncateMetrics\n}`}</Signature>
        <ParamsTable
          cols={["Field", "Type", "Description"]}
          rows={[
            {
              Field: "text",
              Type: "string",
              Description: "The truncated (or original if it fits) text",
            },
            { Field: "original", Type: "string", Description: "The original unmodified text" },
            {
              Field: "truncated",
              Type: "boolean",
              Description: "Whether truncation actually occurred",
            },
            {
              Field: "metrics",
              Type: "TruncateMetrics",
              Description: "Additional metadata about the operation",
            },
          ]}
        />
      </ApiSection>

      <ApiSection id="type-TruncateMetrics" title="TruncateMetrics">
        <Signature>{`interface TruncateMetrics {\n  originalLineCount: number\n}`}</Signature>
      </ApiSection>

      <ApiSection id="type-TruncateOptions" title="TruncateOptions">
        <Signature>{`interface TruncateOptions {\n  font?: string\n  selector?: string\n  maxWidth: CssWidth\n  ellipsis?: string\n  lineHeight?: number\n  maxLines?: number\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n}`}</Signature>
      </ApiSection>

      <ApiSection id="type-MeasureOptions" title="MeasureOptions">
        <Signature>{`interface MeasureOptions {\n  font?: string\n  selector?: string\n  maxWidth: CssWidth\n  lineHeight: number\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n}`}</Signature>
      </ApiSection>

      <ApiSection id="type-TruncatorConfig" title="TruncatorConfig">
        <Signature>{`interface TruncatorConfig {\n  font?: string\n  selector?: string\n  lineHeight?: number\n  ellipsis?: string\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n}`}</Signature>
      </ApiSection>

      <ApiSection id="type-Truncator" title="Truncator">
        <Signature>{`interface Truncator {\n  truncate(text: string, options?: TruncatorCallOptions): TruncateResult\n  truncateByWidth(text: string, options?: TruncatorCallOptions): TruncateResult\n  truncateByLines(text: string, options?: TruncatorCallOptions): TruncateResult\n  truncateStart(text: string, options?: TruncatorCallOptions): TruncateResult\n  truncateMiddle(text: string, options?: TruncatorCallOptions): TruncateResult\n  truncateAtOffset(text: string, options?: TruncatorCallOptions): TruncateResult\n  truncateAround(text: string, options?: TruncatorCallOptions & { target?: string }): TruncateResult\n  measureHeight(text: string, options?: TruncatorMeasureOptions): number\n}`}</Signature>
      </ApiSection>

      <ApiSection id="type-TruncatorCallOptions" title="TruncatorCallOptions">
        <Signature>{`interface TruncatorCallOptions {\n  font?: string\n  maxWidth: CssWidth\n  ellipsis?: string\n  lineHeight?: number\n  maxLines?: number\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n  offset?: number\n  target?: string\n}`}</Signature>
        <Desc>
          Per-call options passed to a <code className="font-mono">Truncator</code> method. Merged
          over the factory config — any field here overrides the pre-set default.
        </Desc>
      </ApiSection>

      <ApiSection id="type-TruncatorMeasureOptions" title="TruncatorMeasureOptions">
        <Signature>{`interface TruncatorMeasureOptions {\n  font?: string\n  maxWidth: CssWidth\n  lineHeight?: number\n  wordBreak?: WordBreakMode\n  letterSpacing?: number\n  whiteSpace?: WhiteSpaceMode\n}`}</Signature>
      </ApiSection>

      <ApiSection id="type-CssWidth" title="CssWidth">
        <Signature>{`type CssWidth = number | string`}</Signature>
        <Desc>
          Accepts a pixel number or a CSS string with unit. Supported units:{" "}
          <code className="font-mono">px</code>, <code className="font-mono">rem</code>,{" "}
          <code className="font-mono">em</code>, <code className="font-mono">ch</code>,{" "}
          <code className="font-mono">vw</code>, <code className="font-mono">vh</code>,{" "}
          <code className="font-mono">vmin</code>, <code className="font-mono">vmax</code>. Bare
          numbers are treated as <code className="font-mono">px</code>.
        </Desc>
      </ApiSection>

      <ApiSection id="type-WordBreakMode" title="WordBreakMode">
        <Signature>{`type WordBreakMode = "normal" | "keep-all"`}</Signature>
        <Desc>
          Passed directly to Pretext. <code className="font-mono">keep-all</code> prevents line
          breaks inside CJK and Hangul runs.
        </Desc>
      </ApiSection>

      <ApiSection id="type-WhiteSpaceMode" title="WhiteSpaceMode">
        <Signature>{`type WhiteSpaceMode = "normal" | "pre-wrap"`}</Signature>
        <Desc>
          Passed directly to Pretext. <code className="font-mono">pre-wrap</code> preserves explicit{" "}
          <code className="font-mono">\n</code> and tabs in the source text.
        </Desc>
      </ApiSection>

      {/* ── Options Reference ── */}
      <Hr />
      <div className="mb-4">
        <T
          as="h2"
          size="l"
          mono
          className="leading-heading ring-0 ring-b-base/15 ring-b-1 pb-1 mb-6"
        >
          Options Reference
        </T>
      </div>

      <T as="p" size="m" dim className="leading-body mb-6">
        Complete reference of every option across all functions, including defaults and required
        status.
      </T>

      <T as="h3" size="m" mono className="mb-3">
        TruncateOptions
      </T>
      <ParamsTable
        cols={["Option", "Type", "Default", "Required", "Used by"]}
        rows={[
          {
            Option: "font",
            Type: "string",
            Default: "—",
            Required: "auto-detect",
            "Used by": "All",
          },
          {
            Option: "selector",
            Type: "string",
            Default: "—",
            Required: "—",
            "Used by": "All (font resolution)",
          },
          {
            Option: "maxWidth",
            Type: "CssWidth",
            Default: "—",
            Required: "always",
            "Used by": "All",
          },
          {
            Option: "lineHeight",
            Type: "number",
            Default: "20",
            Required: "lines only",
            "Used by": "truncateByLines",
          },
          {
            Option: "maxLines",
            Type: "number",
            Default: "—",
            Required: "lines only",
            "Used by": "truncateByLines",
          },
          {
            Option: "ellipsis",
            Type: "string",
            Default: '"…"',
            Required: "—",
            "Used by": "truncation functions",
          },
          {
            Option: "wordBreak",
            Type: "WordBreakMode",
            Default: '"normal"',
            Required: "—",
            "Used by": "All",
          },
          {
            Option: "letterSpacing",
            Type: "number",
            Default: "—",
            Required: "—",
            "Used by": "All",
          },
          {
            Option: "whiteSpace",
            Type: "WhiteSpaceMode",
            Default: '"normal"',
            Required: "—",
            "Used by": "All",
          },
          {
            Option: "offset",
            Type: "number",
            Default: "—",
            Required: "—",
            "Used by": "truncateAtOffset",
          },
          {
            Option: "target",
            Type: "string",
            Default: "—",
            Required: "—",
            "Used by": "truncateAround",
          },
        ]}
      />

      <T as="h3" size="m" mono className="mb-3 mt-6">
        MeasureOptions
      </T>
      <ParamsTable
        cols={["Option", "Type", "Default", "Required"]}
        rows={[
          { Option: "font", Type: "string", Default: "—", Required: "auto-detect" },
          { Option: "selector", Type: "string", Default: "—", Required: "—" },
          { Option: "maxWidth", Type: "CssWidth", Default: "—", Required: "always" },
          { Option: "lineHeight", Type: "number", Default: "—", Required: "always" },
          { Option: "wordBreak", Type: "WordBreakMode", Default: '"normal"', Required: "—" },
          { Option: "letterSpacing", Type: "number", Default: "—", Required: "—" },
          { Option: "whiteSpace", Type: "WhiteSpaceMode", Default: '"normal"', Required: "—" },
        ]}
      />

      <T as="h3" size="m" mono className="mb-3 mt-6">
        TruncatorConfig
      </T>
      <ParamsTable
        cols={["Option", "Type", "Default", "Description"]}
        rows={[
          {
            Option: "font",
            Type: "string",
            Default: "—",
            Description: "Font pre-bound to all methods",
          },
          {
            Option: "selector",
            Type: "string",
            Default: "—",
            Description: "Registered selector for font resolution",
          },
          {
            Option: "lineHeight",
            Type: "number",
            Default: "—",
            Description: "Default line height for lines/height methods",
          },
          { Option: "ellipsis", Type: "string", Default: '"…"', Description: "Default ellipsis" },
          {
            Option: "wordBreak",
            Type: "WordBreakMode",
            Default: '"normal"',
            Description: "Default word-break behaviour",
          },
          {
            Option: "letterSpacing",
            Type: "number",
            Default: "—",
            Description: "Default letter spacing",
          },
          {
            Option: "whiteSpace",
            Type: "WhiteSpaceMode",
            Default: '"normal"',
            Description: "Default whitespace mode",
          },
        ]}
      />

      {/* ── CssWidth Resolution ── */}
      <Hr />
      <div className="mb-4">
        <T
          as="h2"
          size="l"
          mono
          className="leading-heading ring-0 ring-b-base/15 ring-b-1 pb-1 mb-6"
        >
          CssWidth Resolution
        </T>
      </div>
      <Desc>
        When <code className="font-mono">maxWidth</code> is a string, it is parsed at runtime into
        pixels. The following units are supported:
      </Desc>
      <ParamsTable
        cols={["Unit", "Resolves to", "Notes"]}
        rows={[
          { Unit: "px", "Resolves to": "literal value", Notes: "Default when unit is omitted" },
          {
            Unit: "rem",
            "Resolves to": "value × root font-size",
            Notes: "Uses document.documentElement",
          },
          { Unit: "em", "Resolves to": "value × root font-size", Notes: "Same as rem" },
          {
            Unit: "ch",
            "Resolves to": "value × width of '0' in given font",
            Notes: "Requires font context",
          },
          { Unit: "vw", "Resolves to": "value% of viewport width", Notes: "window.innerWidth" },
          { Unit: "vh", "Resolves to": "value% of viewport height", Notes: "window.innerHeight" },
          { Unit: "vmin", "Resolves to": "value% of min(vw, vh)", Notes: "" },
          { Unit: "vmax", "Resolves to": "value% of max(vw, vh)", Notes: "" },
        ]}
      />
      <Desc>
        Unsupported units (<code className="font-mono">%</code> and{" "}
        <code className="font-mono">fr</code>) throw a descriptive{" "}
        <code className="font-mono">TypeError</code> at runtime.
      </Desc>
    </div>
  );
}

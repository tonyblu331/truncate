import { useState } from "react";
import { truncateByLines } from "truncate";
import { T, Slider, Textarea, Section, Code } from "./ui.tsx";

const TEXT = [
  "First line of the text",
  "Second line with more content",
  "Third line here",
  "Fourth line that is somewhat longer content",
  "Fifth line of the text",
].join("\n");

function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function parseKeepLines(value: string): number[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .map(Number)
        .filter((n) => !Number.isNaN(n) && Number.isInteger(n) && n > 0),
    ),
  ];
}

export default function LinesSection() {
  const [text, setText] = useState(TEXT);
  const [maxWidth, setMaxWidth] = useState(400);
  const [lineHeight, setLineHeight] = useState(28);
  const [keepInput, setKeepInput] = useState("1,3,5");
  const keepLines = parseKeepLines(keepInput);

  const result = truncateByLines(text, {
    maxWidth,
    lineHeight,
    keepLines: keepLines.length > 0 ? keepLines : undefined,
  });

  const shownLines = text.split("\n").filter((l, i, a) => i < a.length - 1 || l !== "");
  const keptCount = keepLines.filter((i) => i >= 1 && i <= shownLines.length).length;
  const displayHeight = keptCount > 0 ? keptCount * lineHeight + 32 : 0;

  const code = `truncateByLines(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${maxWidth}, lineHeight: ${lineHeight}, keepLines: ${JSON.stringify(keepLines)} }\n)`;

  return (
    <Section
      id="lines"
      title="Multi-line truncation"
      desc="Select which lines to keep by index. Each kept line is independently truncated to fit the width."
    >
      <Textarea value={text} onChange={setText} rows={3} />

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <Slider
          label="Max width"
          value={maxWidth}
          onChange={setMaxWidth}
          min={200}
          max={700}
          suffix="px"
        />
        <Slider
          label="Line height"
          value={lineHeight}
          onChange={setLineHeight}
          min={16}
          max={48}
          suffix="px"
        />
      </div>

      <div className="flex flex-col gap-1 mt-4">
        <label htmlFor="keep-lines" className="font-mono text-s text-base uppercase">
          Keep lines (1-indexed, comma-separated)
        </label>
        <input
          id="keep-lines"
          type="text"
          value={keepInput}
          onChange={(e) => setKeepInput(e.target.value)}
          placeholder="1,3,5"
          className="w-full max-w-80 text-m p-3 ring-1 ring-base/15 focus:outline-none focus:ring-2 text-base bg-surface"
        />
      </div>

      {shownLines.length > 0 && (
        <T role="secondary" size="s" mono className="block mt-3">
          {shownLines.length} line{shownLines.length === 1 ? "" : "s"} available
        </T>
      )}

      {keepLines.length > 0 ? (
        <div
          className="p-4 mt-4 ring-1 ring-base/15 overflow-hidden"
          style={{ height: displayHeight }}
        >
          <T size="m" className="break-words" style={{ lineHeight: `${lineHeight}px` }}>
            {result.text}
          </T>
        </div>
      ) : (
        keepInput.trim() !== "" && (
          <T role="dim" size="s" mono className="block mt-3">
            No matching lines. Try numbers like 1,3,5
          </T>
        )
      )}

      {result.truncated && keptCount > 0 && (
        <T role="secondary" size="s" mono className="block mt-2">
          {keptCount} line{keptCount === 1 ? "" : "s"} shown, originally{" "}
          {result.metrics.originalLineCount}
        </T>
      )}

      <Code code={code} />
    </Section>
  );
}

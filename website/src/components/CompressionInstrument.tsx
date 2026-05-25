import { useState } from "react";
import { truncateAround, truncateByWidth } from "@tonybonet/truncate";
import { FONT_MAP, SEARCH_TEXT, TARGET_TEXT } from "./playgroundData";
import { RANGE_CLS, T } from "./ui.tsx";

const MIN_WIDTH = 150;
const MAX_WIDTH = 520;
const TICKS = [150, 240, 330, 420, 520];

function HighlightMatch({ text }: { text: string }) {
  const index = text.indexOf(TARGET_TEXT);
  if (index === -1) return <>{text}</>;
  const before = text.slice(0, index);
  const after = text.slice(index + TARGET_TEXT.length);
  return (
    <>
      {before}
      <mark className="bg-base text-surface px-1">{TARGET_TEXT}</mark>
      {after}
    </>
  );
}

function MeasurementRow({
  label,
  status,
  width,
  children,
}: {
  label: string;
  status: string;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <T role="dim" size="s" mono className="uppercase tracking-wider">
          {label}
        </T>
        <T role="dim" size="s" mono>
          {status}
        </T>
      </div>
      <div className="measurement-stage">
        <div className="measurement-window" style={{ width: `min(${width + 24}px, 100%)` }}>
          <T as="div" size="m" className="leading-body whitespace-nowrap overflow-hidden">
            {children}
          </T>
        </div>
      </div>
    </div>
  );
}

export default function CompressionInstrument() {
  const [width, setWidth] = useState(300);
  const plain = truncateByWidth(SEARCH_TEXT, {
    font: FONT_MAP.body,
    maxWidth: width,
  });
  const smart = truncateAround(SEARCH_TEXT, {
    font: FONT_MAP.body,
    maxWidth: width,
    target: TARGET_TEXT,
    context: 7,
  });
  const plainKeepsMatch = plain.text.includes(TARGET_TEXT);
  const smartKeepsMatch = smart.text.includes(TARGET_TEXT);

  return (
    <div className="compression-instrument ring-1 ring-base/15 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 px-3 py-2 ring-0 ring-b-base/15 ring-b-1">
        <div>
          <T role="dim" size="s" mono className="block uppercase tracking-wider">
            squeeze the preview
          </T>
          <T size="s" mono className="block text-base/65 whitespace-nowrap">
            {width}px available
          </T>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {["match survives", "0 layout reads", "grapheme safe"].map((label) => (
            <span
              key={label}
              className="font-mono text-s uppercase tracking-wider px-2 py-1 ring-1 ring-base/15 text-base/65"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MIN_WIDTH}
              max={MAX_WIDTH}
              value={width}
              onChange={(event) => setWidth(+event.target.value)}
              className={`${RANGE_CLS} flex-1 w-full`}
              aria-label="Preview width"
            />
            <T role="dim" size="s" mono className="shrink-0">
              {width}px
            </T>
          </div>
          <div className="ruler" aria-hidden>
            {TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <MeasurementRow
            label="plain width truncation"
            status={plainKeepsMatch ? "match visible" : "match lost"}
            width={width}
          >
            {plain.text}
          </MeasurementRow>
          <MeasurementRow
            label="match-aware truncation"
            status={smartKeepsMatch ? "invoice visible" : "match squeezed"}
            width={width}
          >
            <HighlightMatch text={smart.text} />
          </MeasurementRow>
        </div>
      </div>
    </div>
  );
}

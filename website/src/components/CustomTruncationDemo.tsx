import { useState } from "react";
import { truncateByWidth, truncateMiddle } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, Result, Section, T } from "./ui.tsx";
import { CUSTOM_CASES, CUSTOM_CASE_NAMES, FONT_MAP, short, wDsp, wVal } from "./playgroundData";

type CustomCase = (typeof CUSTOM_CASE_NAMES)[number];
type MarkerVisual = {
  kind: "image" | "video";
  label: string;
  src: string;
};

function splitMarker(text: string, marker: string): { body: string; marker: string } {
  if (!marker || !text.endsWith(marker)) return { body: text, marker: "" };
  return { body: text.slice(0, -marker.length), marker };
}

function splitVisualMarker(
  text: string,
  marker: string,
): { before: string; marker: string; after: string } {
  const markerIndex = findMarkerClosestToCenter(text, marker);
  if (markerIndex === -1) return { before: text, marker: "", after: "" };
  return {
    before: text.slice(0, markerIndex),
    marker,
    after: text.slice(markerIndex + marker.length),
  };
}

function findMarkerClosestToCenter(text: string, marker: string): number {
  if (!marker) return -1;
  const center = text.length / 2;
  let bestIndex = -1;
  let bestDistance = Infinity;
  let index = text.indexOf(marker);
  while (index !== -1) {
    const distance = Math.abs(index - center);
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
    index = text.indexOf(marker, index + marker.length);
  }
  return bestIndex;
}

function VisualMarker({ marker }: { marker: MarkerVisual }) {
  return (
    <span className="custom-preview-media-marker" role="img" aria-label={marker.label}>
      {marker.kind === "video" ? (
        <video autoPlay loop muted playsInline preload="metadata" src={marker.src} />
      ) : (
        <img alt="" loading="lazy" src={marker.src} />
      )}
    </span>
  );
}

function Preview({
  text,
  marker,
  visualMarker,
}: {
  text: string;
  marker: string;
  visualMarker?: MarkerVisual;
}) {
  if (visualMarker) {
    const parts = splitVisualMarker(text, marker);
    return (
      <span className="custom-preview">
        <span>{parts.before}</span>
        {parts.marker && <VisualMarker marker={visualMarker} />}
        <span>{parts.after}</span>
      </span>
    );
  }

  const parts = splitMarker(text, marker);
  return (
    <span className="custom-preview">
      <span className={parts.marker ? "custom-preview-copy" : undefined}>{parts.body}</span>
      {parts.marker && <span className="custom-preview-marker">{parts.marker}</span>}
    </span>
  );
}

export default function CustomTruncationDemo() {
  const [caseName, setCaseName] = useState<CustomCase>("readmore");
  const activeCase = CUSTOM_CASES[caseName];
  const [text, setText] = useState<string>(activeCase.text);
  const [marker, setMarker] = useState<string>(activeCase.marker);
  const [width, setWidth] = useState<number>(activeCase.width);
  const [unit, setUnit] = useState("px");
  const maxWidth = wVal(width, unit);
  const truncateFn = activeCase.method === "truncateMiddle" ? truncateMiddle : truncateByWidth;
  const result = truncateFn(text, {
    font: FONT_MAP.body,
    maxWidth,
    ellipsis: marker,
  });

  const chooseCase = (selected: CustomCase) => {
    setCaseName(selected);
    setText(CUSTOM_CASES[selected].text);
    setMarker(CUSTOM_CASES[selected].marker);
    setWidth(CUSTOM_CASES[selected].width);
    setUnit("px");
  };

  return (
    <Section
      id="custom-truncation"
      title="Custom truncation"
      desc="Use words, safe emoji, or a measurable token that renders as a GIF or video in the truncated slot."
      actions={
        <div className="flex flex-wrap gap-2" role="group" aria-label="Custom truncation cases">
          {CUSTOM_CASE_NAMES.map((name) => {
            const selected = name === caseName;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseCase(name)}
                className={`font-mono text-s px-3 py-1.5 ring-1 transition-colors ${
                  selected
                    ? "bg-base text-surface ring-base"
                    : "bg-surface text-base ring-base/15 hover:ring-base/45"
                }`}
              >
                {CUSTOM_CASES[name].label}
              </button>
            );
          })}
        </div>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface"
        aria-label="Custom truncation sample"
      />

      <div className="flex flex-wrap items-end gap-4 mt-4">
        <WidthControl
          value={width}
          unit={unit}
          onChange={setWidth}
          onUnitChange={setUnit}
          min={90}
          max={560}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="custom-marker" className="font-mono text-s text-base uppercase">
            Token
          </label>
          <input
            id="custom-marker"
            type="text"
            value={marker}
            onChange={(e) => setMarker(e.target.value)}
            className="w-44 text-m p-3 ring-1 ring-base/15 focus:outline-none focus:ring-2 text-base bg-surface"
            aria-label="Custom truncation marker"
          />
        </div>
      </div>

      <Result>
        {result.text ? (
          <div className="custom-result-stack">
            <div className="custom-truncated-caption">
              <span className="font-mono text-s uppercase text-dim">
                {activeCase.method} output
              </span>
              <Preview
                text={result.text}
                marker={marker}
                visualMarker={"markerVisual" in activeCase ? activeCase.markerVisual : undefined}
              />
            </div>
          </div>
        ) : (
          <T size="m" role="secondary">
            The marker is wider than the available box.
          </T>
        )}
      </Result>

      <Code
        code={`${activeCase.method}(\n  ${JSON.stringify(short(text, 72))},\n  { maxWidth: ${wDsp(width, unit)}, ellipsis: ${JSON.stringify(marker)} }\n)${"markerVisual" in activeCase ? "\n// Render the token slot as media in UI." : ""}`}
      />
    </Section>
  );
}

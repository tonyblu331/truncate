import { useState } from "react";
import { truncateAround, truncateRange } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, Result, Section, Slider, T } from "./ui.tsx";
import { FONT_MAP, SEARCH_TEXT, TARGET_TEXT, short, wDsp, wVal } from "./playgroundData";

export default function TargetRangeDemo() {
  const [width, setWidth] = useState(260);
  const [unit, setUnit] = useState("px");
  const [context, setContext] = useState(8);
  const start = SEARCH_TEXT.indexOf(TARGET_TEXT);
  const end = start + TARGET_TEXT.length;
  const maxWidth = wVal(width, unit);
  const around = truncateAround(SEARCH_TEXT, {
    font: FONT_MAP.body,
    maxWidth,
    target: TARGET_TEXT,
    context,
  });
  const range = truncateRange(SEARCH_TEXT, {
    font: FONT_MAP.body,
    maxWidth,
    start,
    end,
    before: context,
    after: context,
  });

  return (
    <Section
      id="target-range"
      title="Target and range preservation"
      desc="Keep the matched text visible inside a long support note. Use the target string, or pass explicit offsets from search."
    >
      <div className="flex flex-wrap gap-4 mt-4">
        <WidthControl
          value={width}
          unit={unit}
          onChange={setWidth}
          onUnitChange={setUnit}
          min={120}
          max={520}
        />
        <Slider label="Context" value={context} onChange={setContext} min={0} max={24} />
      </div>
      <Result>
        <div className="space-y-4">
          <div>
            <T role="dim" size="s" mono className="block mb-1 uppercase tracking-wider">
              target
            </T>
            <T size="m" className="leading-body break-words">
              {around.text}
            </T>
          </div>
          <div>
            <T role="dim" size="s" mono className="block mb-1 uppercase tracking-wider">
              range
            </T>
            <T size="m" className="leading-body break-words">
              {range.text}
            </T>
          </div>
        </div>
      </Result>
      <Code
        code={`truncateAround(\n  ${JSON.stringify(short(SEARCH_TEXT))},\n  { maxWidth: ${wDsp(width, unit)}, target: "${TARGET_TEXT}", context: ${context} }\n)\n\ntruncateRange(text, {\n  maxWidth: ${wDsp(width, unit)},\n  start: ${start},\n  end: ${end},\n  before: ${context},\n  after: ${context},\n})`}
      />
    </Section>
  );
}

import { useState } from "react";
import { createTruncator } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, Result, Section, Slider, T, ToggleGroup } from "./ui.tsx";
import { FONT_MAP, LONG, SELECTORS, SELS, short, wDsp, wVal } from "./playgroundData";

export default function FactoryDemo() {
  const [width, setWidth] = useState(400);
  const [unit, setUnit] = useState("px");
  const [lines, setLines] = useState(2);
  const [activeSels, setActiveSels] = useState(new Set(["body"]));
  const factoryResults: Record<string, string> = {};
  for (const selector of SELS) {
    factoryResults[selector] = activeSels.has(selector)
      ? createTruncator({ font: FONT_MAP[selector], lineHeight: 28 }).truncateByLines(LONG, {
          maxWidth: wVal(width, unit),
          maxLines: lines,
        }).text
      : LONG;
  }
  const factoryCode = SELS.filter((selector) => activeSels.has(selector))
    .map(
      (selector) =>
        `const t${selector.charAt(0).toUpperCase() + selector.slice(1)} = createTruncator({ font: '${FONT_MAP[selector]}', lineHeight: 28 })\nt${selector.charAt(0).toUpperCase() + selector.slice(1)}.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${wDsp(width, unit)}, maxLines: ${lines} }\n)`,
    )
    .join("\n\n");
  const toggle = (selector: string) => {
    const next = new Set(activeSels);
    if (next.has(selector)) next.delete(selector);
    else next.add(selector);
    setActiveSels(next);
  };

  return (
    <Section
      id="factory"
      title="Truncator factory"
      desc="Toggle truncation per selector. Each uses its registered font. ON = truncated, OFF = full text."
    >
      <div className="flex flex-wrap items-start gap-4 mt-4">
        <WidthControl
          value={width}
          unit={unit}
          onChange={setWidth}
          onUnitChange={setUnit}
          min={200}
          max={700}
        />
        <Slider label="Max lines" value={lines} onChange={setLines} min={1} max={8} />
      </div>
      <div className="mb-5">
        <ToggleGroup value={activeSels} onChange={toggle} options={SELECTORS} />
      </div>
      <Result>
        {SELS.map((selector, i) => (
          <div key={selector}>
            {i > 0 && <hr className="my-3 border-t border-base/15" />}
            <div className="flex items-baseline gap-2 mb-0.5">
              <T role="dim" size="s" mono className="shrink-0">
                {selector}
              </T>
              <T role="dim" size="s" mono className="shrink-0">
                ({activeSels.has(selector) ? FONT_MAP[selector] : "full"})
              </T>
            </div>
            <div
              className="factory-row"
              style={{
                maxHeight: activeSels.has(selector) ? `${lines * 31}px` : "4000px",
              }}
            >
              <T size="m" className="leading-body break-words">
                {factoryResults[selector]}
              </T>
            </div>
          </div>
        ))}
      </Result>
      <Code code={factoryCode} />
    </Section>
  );
}

import { useState } from "react";
import { truncateByWidth } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, Result, Section, T, Textarea } from "./ui.tsx";
import { FONT_MAP, LANGS, short, wDsp, wVal } from "./playgroundData";

export default function CjkDemo() {
  const [text, setText] = useState(LANGS.cjk);
  const [width, setWidth] = useState(200);
  const [unit, setUnit] = useState("px");
  const normal = truncateByWidth(text, { font: FONT_MAP.body, maxWidth: wVal(width, unit) });
  const keepAll = truncateByWidth(text, {
    font: FONT_MAP.body,
    maxWidth: wVal(width, unit),
    wordBreak: "keep-all",
  });
  return (
    <Section
      id="cjk"
      title="CJK word break"
      desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs keep-all on the same text."
    >
      <Textarea value={text} onChange={setText} />
      <div className="flex flex-wrap gap-4 mt-4">
        <WidthControl
          value={width}
          unit={unit}
          onChange={setWidth}
          onUnitChange={setUnit}
          max={500}
        />
      </div>
      <Result>
        <T size="m" className="leading-body break-words mb-3">
          {normal.text}
        </T>
        <T size="m" className="leading-body break-words">
          {keepAll.text}
        </T>
      </Result>
      <Code
        code={`// normal\ntruncateByWidth(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${wDsp(width, unit)} }\n)\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${wDsp(width, unit)}, wordBreak: "keep-all" }\n)`}
      />
    </Section>
  );
}

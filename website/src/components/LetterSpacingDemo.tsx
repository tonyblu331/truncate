import { useState } from "react";
import { truncateByWidth } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, Result, Section, Slider, Textarea } from "./ui.tsx";
import { FONT_MAP, QUICK, short, wDsp, wVal } from "./playgroundData";

export default function LetterSpacingDemo() {
  const [text, setText] = useState(QUICK);
  const [width, setWidth] = useState(350);
  const [unit, setUnit] = useState("px");
  const [spacing, setSpacing] = useState(3);
  const result = truncateByWidth(text, {
    font: FONT_MAP.body,
    maxWidth: wVal(width, unit),
    letterSpacing: spacing,
  });
  return (
    <Section
      id="spacing"
      title="Letter spacing"
      desc="Pass letterSpacing in CSS px to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner."
    >
      <Textarea value={text} onChange={setText} />
      <div className="flex flex-wrap gap-4 mt-4">
        <WidthControl value={width} unit={unit} onChange={setWidth} onUnitChange={setUnit} />
        <Slider
          label="Letter spacing"
          value={spacing}
          onChange={setSpacing}
          min={0}
          max={12}
          suffix="px"
        />
      </div>
      <Result>
        <span style={{ letterSpacing: spacing + "px" }}>{result.text}</span>
      </Result>
      <Code
        code={`truncateByWidth(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${wDsp(width, unit)}, letterSpacing: ${spacing} }\n)`}
      />
    </Section>
  );
}

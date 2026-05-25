import { useState } from "react";
import { truncateByWidth } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, Result, Section, Textarea } from "./ui.tsx";
import { FONT_MAP, QUICK, short, wDsp, wVal } from "./playgroundData";

export default function WidthDemo() {
  const [text, setText] = useState(QUICK);
  const [width, setWidth] = useState(350);
  const [unit, setUnit] = useState("px");
  const result = truncateByWidth(text, { font: FONT_MAP.body, maxWidth: wVal(width, unit) });
  return (
    <Section
      id="width"
      title="Width truncation"
      desc="Fit text to one measured line and append an ellipsis only when it overflows."
    >
      <Textarea value={text} onChange={setText} />
      <div className="flex flex-wrap gap-4 mt-4">
        <WidthControl value={width} unit={unit} onChange={setWidth} onUnitChange={setUnit} />
      </div>
      <Result>{result.text}</Result>
      <Code
        code={`truncateByWidth(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${wDsp(width, unit)} }\n)`}
      />
    </Section>
  );
}

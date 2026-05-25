import { useState } from "react";
import { truncateByWidth } from "@tonybonet/truncate";
import WidthControl from "./WidthControl";
import { Code, RadioGroup, Result, Section, T, Textarea } from "./ui.tsx";
import { FONT_MAP, LANGS, LANG_NAMES, short, wDsp, wVal } from "./playgroundData";

export default function LanguageDemo() {
  const [text, setText] = useState(LANGS.english);
  const [language, setLanguage] = useState("english");
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
      id="languages"
      title="Languages"
      desc="Switch between scripts to see how wordBreak keep-all affects each language differently. Adjust the width to find each language's breakpoint."
      actions={
        <RadioGroup
          name="lang"
          value={language}
          onChange={(next) => {
            setLanguage(next);
            setText(LANGS[next]);
          }}
          options={LANG_NAMES}
        />
      }
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
        code={`truncateByWidth(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${wDsp(width, unit)} }\n)\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(text))},\n  { maxWidth: ${wDsp(width, unit)}, wordBreak: "keep-all" }\n)`}
      />
    </Section>
  );
}

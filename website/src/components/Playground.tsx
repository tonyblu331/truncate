import { useState } from "react";
import { truncateByWidth, createTruncator, detectFont, register } from "truncate";
import {
  T,
  Slider,
  Textarea,
  Section,
  Result,
  Code,
  Divider,
  RadioGroup,
  ToggleGroup,
  BTN_CLS,
} from "./ui.tsx";
import LinesSection from "./LinesSection.tsx";
import ApiDocs from "./ApiDocs";

detectFont();

register("body", { font: "18px Geist" });
register("h1", { font: "26px Geist" });
register("code", { font: "13px Geist Mono" });

const INSTALL = [
  { label: "pnpm", cmd: "pnpm add truncate" },
  { label: "bun", cmd: "bun add truncate" },
  { label: "npm", cmd: "npm install truncate" },
  { label: "yarn", cmd: "yarn add truncate" },
];

const QUICK =
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!";
const LONG =
  "Typography is the visual component of the written word. A text must be readable and legible. But more than that, it should convey the tone and voice of the message. The choice of typeface, the spacing between letters and lines, the measure of the column. All of these elements work together to create an experience for the reader. In digital interfaces, truncation becomes a necessary tool when this carefully crafted text exceeds its container. Good truncation preserves meaning while respecting layout constraints.";

const LANGS: Record<string, string> = {
  english: "The quick brown fox jumps over the lazy dog.",
  spanish: "El veloz murciélago hindú comía feliz cardillo y kiwi.",
  german: "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich.",
  russian: "Съешь ещё этих мягких французских булок, да выпей чаю.",
  thai: "เป็นมนุษย์สุดประเสริฐเลิศคุณค่า กว่าบรรดาฝูงสัตว์เดรัจฉาน",
  cjk: "天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光",
};

const LANG_NAMES = ["english", "spanish", "german", "russian", "thai", "cjk"] as const;

const SELS = ["body", "h1", "code"] as const;
const FONT_MAP: Record<string, string> = {
  body: "18px Geist",
  h1: "26px Geist",
  code: "13px Geist Mono",
};

const SELECTORS = SELS.map((s) => ({ value: s, label: s }));

function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function Playground({
  bundleSize,
  bundleGzip,
}: {
  bundleSize?: string;
  bundleGzip?: string;
}) {
  const [t1, setT1] = useState(QUICK);
  const [w1, setW1] = useState(350);

  const [langText, setLangText] = useState(LANGS.english);
  const [lang, setLang] = useState("english");
  const [langWidth, setLangWidth] = useState(200);

  const [cjkText, setCjkText] = useState(LANGS.cjk);
  const [cjkWidth, setCjkWidth] = useState(200);

  const [t5, setT5] = useState(QUICK);
  const [w5, setW5] = useState(350);
  const [s5, setS5] = useState(3);

  const [w6, setW6] = useState(400);
  const [l6, setL6] = useState(2);
  const [activeSels, setActiveSels] = useState(new Set(["body"]));
  const [tab, setTab] = useState<"demos" | "api">("demos");

  const r1 = truncateByWidth(t1, { maxWidth: w1 });
  const langNormal = truncateByWidth(langText, { maxWidth: langWidth });
  const langKeepAll = truncateByWidth(langText, { maxWidth: langWidth, wordBreak: "keep-all" });
  const cjkNormal = truncateByWidth(cjkText, { maxWidth: cjkWidth });
  const cjkKeepAll = truncateByWidth(cjkText, { maxWidth: cjkWidth, wordBreak: "keep-all" });
  const r5 = truncateByWidth(t5, { maxWidth: w5, letterSpacing: s5 });

  const factoryResults: Record<string, string> = {};
  for (const s of SELS) {
    factoryResults[s] = activeSels.has(s)
      ? createTruncator({ selector: s, lineHeight: 28 }).truncateByLines(LONG, {
          maxWidth: w6,
          maxLines: l6,
        }).text
      : LONG;
  }

  const factoryCode = SELS.filter((s) => activeSels.has(s))
    .map(
      (s) =>
        `const t${s.charAt(0).toUpperCase() + s.slice(1)} = createTruncator({ selector: '${s}', lineHeight: 28 })\nt${s.charAt(0).toUpperCase() + s.slice(1)}.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w6}, maxLines: ${l6} }\n)\n// ${FONT_MAP[s]}`,
    )
    .join("\n\n");

  const toggle = (s: string) => {
    const next = new Set(activeSels);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setActiveSels(next);
  };

  return (
    <div>
      <header className="pt-24 pb-8 mb-16 ring-0 ring-b-base/15 ring-b-1">
        <T as="h1" size="l" className="mb-1 leading-heading text-balance">
          Truncate
        </T>
        <T role="secondary" size="m" as="p" className="leading-body mb-6">
          Dom-free text truncation. Measure text by pixel width or line count. No font ceremony,
          auto-detect from the page.
        </T>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {INSTALL.map(({ label, cmd }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigator.clipboard.writeText(cmd)}
              className={BTN_CLS}
            >
              <T role="dim" as="span" size="s" mono>
                $
              </T>{" "}
              {cmd}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <T role="dim" size="s" mono>
            {bundleSize} {bundleGzip ? `(${bundleGzip} gzip)` : ""}
          </T>
          <T role="dim" size="s" mono className="text-base/15">
            /
          </T>
          <a
            href="https://github.com/tonyblu331/truncate?tab=readme-ov-file#api"
            target="_blank"
            rel="noreferrer"
          >
            <T
              role="secondary"
              size="s"
              mono
              as="span"
              className="underline underline-offset-2 hover:text-base"
            >
              Docs
            </T>
          </a>
          <T role="dim" size="s" mono className="text-base/15">
            /
          </T>
          <a href="https://github.com/tonyblu331/truncate" target="_blank" rel="noreferrer">
            <T
              role="secondary"
              size="s"
              mono
              as="span"
              className="underline underline-offset-2 hover:text-base"
            >
              GitHub
            </T>
          </a>
        </div>
      </header>

      <div className="flex mb-16 font-mono text-s ring-1 ring-base" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "demos"}
          onClick={() => setTab("demos")}
          className={`px-3 py-1.5 cursor-pointer uppercase tracking-wider ${
            tab === "demos" ? "bg-base text-surface" : "text-base hover:bg-base hover:text-surface"
          }`}
        >
          Demos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "api"}
          onClick={() => setTab("api")}
          className={`px-3 py-1.5 cursor-pointer uppercase tracking-wider ${
            tab === "api" ? "bg-base text-surface" : "text-base hover:bg-base hover:text-surface"
          }`}
        >
          API Docs
        </button>
      </div>

      <div key={tab} className="tab-panel">
        {tab === "demos" ? (
          <>
            <Section
              id="width"
              title="Width truncation"
              desc="Truncate text to fit a pixel width on a single line. Measures each prefix, appends an ellipsis on overflow."
            >
              <Textarea value={t1} onChange={setT1} />
              <div className="flex flex-wrap gap-4 mt-4">
                <Slider
                  label="Max width"
                  value={w1}
                  onChange={setW1}
                  min={50}
                  max={600}
                  suffix="px"
                />
              </div>
              <Result>{r1.text}</Result>
              <Code
                code={`truncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { maxWidth: ${w1} }\n)`}
              />
            </Section>

            <Divider />

            <LinesSection />

            <Divider />

            <Section
              id="languages"
              title="Languages"
              desc="Switch between scripts to see how wordBreak keep-all affects each language differently. Adjust the width to find each language's breakpoint."
              actions={
                <RadioGroup
                  name="lang"
                  value={lang}
                  onChange={(l) => {
                    setLang(l);
                    setLangText(LANGS[l]);
                  }}
                  options={LANG_NAMES}
                />
              }
            >
              <Textarea value={langText} onChange={setLangText} />
              <div className="flex flex-wrap gap-4 mt-4">
                <Slider
                  label="Max width"
                  value={langWidth}
                  onChange={setLangWidth}
                  min={50}
                  max={500}
                  suffix="px"
                />
              </div>
              <Result>
                <T size="m" className="leading-body break-words mb-3">
                  {langNormal.text}
                </T>
                <T size="m" className="leading-body break-words">
                  {langKeepAll.text}
                </T>
              </Result>
              <Code
                code={`truncateByWidth(\n  ${JSON.stringify(short(langText))},\n  { maxWidth: ${langWidth} }\n)\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(langText))},\n  { maxWidth: ${langWidth}, wordBreak: "keep-all" }\n)`}
              />
            </Section>

            <Divider />

            <Section
              id="cjk"
              title="CJK word break"
              desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs keep-all on the same text."
            >
              <Textarea value={cjkText} onChange={setCjkText} />
              <div className="flex flex-wrap gap-4 mt-4">
                <Slider
                  label="Max width"
                  value={cjkWidth}
                  onChange={setCjkWidth}
                  min={50}
                  max={500}
                  suffix="px"
                />
              </div>
              <Result>
                <T size="m" className="leading-body break-words mb-3">
                  {cjkNormal.text}
                </T>
                <T size="m" className="leading-body break-words">
                  {cjkKeepAll.text}
                </T>
              </Result>
              <Code
                code={`// normal\ntruncateByWidth(\n  ${JSON.stringify(short(cjkText))},\n  { maxWidth: ${cjkWidth} }\n)\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(cjkText))},\n  { maxWidth: ${cjkWidth}, wordBreak: "keep-all" }\n)`}
              />
            </Section>

            <Divider />

            <Section
              id="spacing"
              title="Letter spacing"
              desc="Pass letterSpacing in CSS px to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner."
            >
              <Textarea value={t5} onChange={setT5} />
              <div className="flex flex-wrap gap-4 mt-4">
                <Slider
                  label="Max width"
                  value={w5}
                  onChange={setW5}
                  min={50}
                  max={600}
                  suffix="px"
                />
                <Slider
                  label="Letter spacing"
                  value={s5}
                  onChange={setS5}
                  min={0}
                  max={12}
                  suffix="px"
                />
              </div>
              <Result>
                <span style={{ letterSpacing: s5 + "px" }}>{r5.text}</span>
              </Result>
              <Code
                code={`truncateByWidth(\n  ${JSON.stringify(short(t5))},\n  { maxWidth: ${w5}, letterSpacing: ${s5} }\n)`}
              />
            </Section>

            <Divider />

            <Section
              id="factory"
              title="Truncator factory"
              desc="Toggle truncation per selector. Each uses its registered font. ON = truncated, OFF = full text."
              headerRight={<ToggleGroup value={activeSels} onChange={toggle} options={SELECTORS} />}
            >
              <div className="flex flex-wrap items-start gap-4 mt-4">
                <Slider
                  label="Max width"
                  value={w6}
                  onChange={setW6}
                  min={200}
                  max={700}
                  suffix="px"
                />
                <Slider label="Max lines" value={l6} onChange={setL6} min={1} max={8} />
              </div>
              <Result>
                {SELS.map((s, i) => (
                  <div key={s}>
                    {i > 0 && <hr className="my-3 ring-0 ring-t-base/15 ring-t-1" />}
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <T role="dim" size="s" mono className="shrink-0">
                        {s}
                      </T>
                      <T role="dim" size="s" mono className="shrink-0">
                        ({activeSels.has(s) ? FONT_MAP[s] : "full"})
                      </T>
                    </div>
                    <div
                      className="factory-row"
                      style={{
                        maxHeight: activeSels.has(s) ? `${l6 * 31}px` : "4000px",
                      }}
                    >
                      <T size="m" className="leading-body break-words">
                        {factoryResults[s]}
                      </T>
                    </div>
                  </div>
                ))}
              </Result>
              <Code code={factoryCode} />
            </Section>
          </>
        ) : (
          <ApiDocs />
        )}
      </div>
    </div>
  );
}

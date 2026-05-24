import { useState, type ReactNode } from "react";
import { truncateByWidth, truncateByLines, createTruncator, detectFont, register } from "truncate";

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

const SELECTORS = [
  { value: "body", label: "body" },
  { value: "h1", label: "h1" },
  { value: "code", label: "code" },
];

const SCENARIOS = [
  { id: "width", label: "Width" },
  { id: "lines", label: "Lines" },
  { id: "languages", label: "Languages" },
  { id: "cjk", label: "CJK" },
  { id: "spacing", label: "Spacing" },
  { id: "factory", label: "Factory" },
];

const RANGE_CLS =
  "w-40 h-px appearance-none bg-base/35 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer";
const BTN_CLS =
  "font-mono text-s px-3 py-1.5 ring-1 ring-base/15 text-base no-underline cursor-pointer hover:bg-base hover:text-surface transition-colors";

type Role = "primary" | "secondary" | "dim";
type Sz = "s" | "m" | "l";

const roleCls: Record<Role, string> = {
  primary: "text-base",
  secondary: "text-dim",
  dim: "text-dim",
};
const szCls: Record<Sz, string> = { s: "text-s", m: "text-m", l: "text-l" };

function T({
  role = "primary",
  size = "m",
  mono = false,
  as: Tag = "span",
  className = "",
  style,
  children,
}: {
  role?: Role;
  size?: Sz;
  mono?: boolean;
  as?: "p" | "span" | "div" | "label" | "h1" | "h2";
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <Tag
      style={style}
      className={`${szCls[size]} ${roleCls[role]} ${mono ? "font-mono" : "font-sans"} ${className}`}
    >
      {children}
    </Tag>
  );
}

function Section({
  id,
  title,
  desc,
  actions,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-24">
      <T
        as="h2"
        size="l"
        className="mb-1 ring-0 ring-b-base/15 ring-b-1 pb-1 leading-heading text-balance"
      >
        {title}
      </T>
      <T role="secondary" size="m" as="p" className="leading-body mb-6">
        {desc}
      </T>
      {actions && <div className="flex flex-wrap items-start gap-x-6 gap-y-3 mb-4">{actions}</div>}
      {children}
    </section>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 mb-24 select-none" aria-hidden>
      <hr className="flex-1 ring-0 ring-t-base/15 ring-t-1" />
      <T size="m" className="text-base/85 tracking-[0.2em] select-none">
        ...
      </T>
      <hr className="flex-1 ring-0 ring-t-base/15 ring-t-1" />
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  const id = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-s text-dim uppercase">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className={RANGE_CLS}
          aria-label={label}
        />
        <span className="font-mono text-s text-base">
          {value}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center font-mono text-s text-dim cursor-pointer capitalize"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="appearance-none w-3 h-3 rounded-full ring-1 ring-base mr-1.5 cursor-pointer checked:bg-base"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function ToggleGroup({
  value,
  onChange,
  options,
}: {
  value: Set<string>;
  onChange: (v: string) => void;
  options: { value: string; label?: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center font-mono text-s text-dim cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value.has(opt.value)}
            onChange={() => onChange(opt.value)}
            className="appearance-none w-3 h-3 ring-1 ring-base mr-1.5 cursor-pointer checked:bg-base"
          />
          {opt.label ?? opt.value}
        </label>
      ))}
    </div>
  );
}

function Result({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 mt-4 ring-1 ring-base/15 min-h-12">
      <T size="m" className="leading-body break-words">
        {children}
      </T>
    </div>
  );
}

function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-4">
      <pre className="font-mono text-s leading-relaxed ring-1 ring-base/15 p-4 pt-8 overflow-x-auto">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="absolute -top-px right-0 font-mono text-s px-2 py-0.5 ring-1 ring-base/15 bg-surface text-base hover:bg-base hover:text-surface"
        >
          {copied ? "copied" : "copy"}
        </button>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function Textarea({
  value,
  onChange,
  rows = 2,
  label = "Sample text",
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  label?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface"
      aria-label={label}
    />
  );
}

export default function Playground() {
  const [t1, setT1] = useState(QUICK);
  const [w1, setW1] = useState(350);

  const [t2, setT2] = useState(LONG);
  const [w2, setW2] = useState(400);
  const [l2, setL2] = useState(3);
  const [lh2, setLh2] = useState(28);

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

  const r1 = truncateByWidth(t1, { maxWidth: w1 });
  const r2 = truncateByLines(t2, { maxWidth: w2, lineHeight: lh2, maxLines: l2 });
  const langNormal = truncateByWidth(langText, { maxWidth: langWidth });
  const langKeepAll = truncateByWidth(langText, { maxWidth: langWidth, wordBreak: "keep-all" });
  const cjkNormal = truncateByWidth(cjkText, { maxWidth: cjkWidth });
  const cjkKeepAll = truncateByWidth(cjkText, { maxWidth: cjkWidth, wordBreak: "keep-all" });
  const r5 = truncateByWidth(t5, { maxWidth: w5, letterSpacing: s5 });

  const factoryResults = {
    body: activeSels.has("body")
      ? createTruncator({ selector: "body", lineHeight: 28 }).truncateByLines(LONG, {
          maxWidth: w6,
          maxLines: l6,
        }).text
      : LONG,
    h1: activeSels.has("h1")
      ? createTruncator({ selector: "h1", lineHeight: 28 }).truncateByLines(LONG, {
          maxWidth: w6,
          maxLines: l6,
        }).text
      : LONG,
    code: activeSels.has("code")
      ? createTruncator({ selector: "code", lineHeight: 28 }).truncateByLines(LONG, {
          maxWidth: w6,
          maxLines: l6,
        }).text
      : LONG,
  };

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
            Bundle ~1.6 kB gzip
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

      <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-16" aria-label="Demos">
        {SCENARIOS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="underline underline-offset-2">
            <T role="secondary" size="s" mono as="span" className="hover:text-base">
              {s.label}
            </T>
          </a>
        ))}
      </nav>

      <Section
        id="width"
        title="Width truncation"
        desc="Truncate text to fit a pixel width on a single line. Measures each prefix, appends an ellipsis on overflow."
      >
        <Textarea value={t1} onChange={setT1} />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w1} onChange={setW1} min={50} max={600} suffix="px" />
        </div>
        <Result>{r1.text}</Result>
        <Code
          code={`truncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { maxWidth: ${w1} }\n)`}
        />
      </Section>

      <Divider />

      <Section
        id="lines"
        title="Multi-line truncation"
        desc="Truncate text within N lines. Full lines above, truncated last line below."
      >
        <Textarea value={t2} onChange={setT2} rows={3} />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w2} onChange={setW2} min={200} max={700} suffix="px" />
          <Slider label="Max lines" value={l2} onChange={setL2} min={1} max={10} />
          <Slider label="Line height" value={lh2} onChange={setLh2} min={16} max={48} suffix="px" />
        </div>
        <div
          className="p-4 mt-4 ring-1 ring-base/15 overflow-hidden"
          style={{ height: l2 * lh2 + 32 }}
        >
          <T
            size="m"
            className="break-words"
            style={{ lineHeight: lh2 + "px" } as React.CSSProperties}
          >
            {r2.text}
          </T>
        </div>
        <Code
          code={`truncateByLines(\n  ${JSON.stringify(short(t2))},\n  { maxWidth: ${w2}, lineHeight: ${lh2}, maxLines: ${l2} }\n)`}
        />
      </Section>

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
        <div className="p-4 mt-4 ring-1 ring-base/15">
          <T role="dim" size="s" mono className="mb-1">
            Normal
          </T>
          <T size="m" className="leading-body break-words mb-3">
            {langNormal.text}
          </T>
          <T role="dim" size="s" mono className="mb-1">
            Keep all
          </T>
          <T size="m" className="leading-body break-words">
            {langKeepAll.text}
          </T>
        </div>
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
        <div className="p-4 mt-4 ring-1 ring-base/15">
          <T role="dim" size="s" mono className="mb-1">
            Normal
          </T>
          <T size="m" className="leading-body break-words mb-3">
            {cjkNormal.text}
          </T>
          <T role="dim" size="s" mono className="mb-1">
            Keep all
          </T>
          <T size="m" className="leading-body break-words">
            {cjkKeepAll.text}
          </T>
        </div>
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
          <Slider label="Max width" value={w5} onChange={setW5} min={50} max={600} suffix="px" />
          <Slider label="Letter spacing" value={s5} onChange={setS5} min={0} max={12} suffix="px" />
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
        actions={<ToggleGroup value={activeSels} onChange={toggle} options={SELECTORS} />}
      >
        <div className="flex flex-wrap items-start gap-4 mt-4">
          <Slider label="Max width" value={w6} onChange={setW6} min={200} max={700} suffix="px" />
          <Slider label="Max lines" value={l6} onChange={setL6} min={1} max={8} />
        </div>
        <div className="p-4 mt-4 ring-1 ring-base/15">
          {(["body", "h1", "code"] as const).map((s, i) => (
            <div key={s}>
              {i > 0 && <hr className="my-3 ring-0 ring-t-base/15 ring-t-1" />}
              <div className="flex items-baseline gap-2">
                <T role="dim" size="s" mono className="shrink-0">
                  {s}
                </T>
                <T size="m" className="leading-body break-words">
                  {factoryResults[s]}
                </T>
                <T role="dim" size="s" mono className="shrink-0">
                  (
                  {activeSels.has(s)
                    ? `${s === "code" ? "13px Geist Mono" : s === "h1" ? "26px Geist" : "18px Geist"}`
                    : "full"}
                  )
                </T>
              </div>
            </div>
          ))}
        </div>
        <Code
          code={`const tBody = createTruncator({ selector: 'body', lineHeight: 28 })\nconst tH1   = createTruncator({ selector: 'h1', lineHeight: 28 })\nconst tCode = createTruncator({ selector: 'code', lineHeight: 28 })\n\ntBody.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w6}, maxLines: ${l6} }\n)\n// 18px Geist`}
        />
      </Section>
    </div>
  );
}

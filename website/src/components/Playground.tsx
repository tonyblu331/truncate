import { useState } from 'react'
import { truncateByWidth, truncateByLines, truncateMiddle, measureHeight, createTruncator } from 'truncate'
import { useDetectFont } from './useDetectFont'

const INSTALL = [
  { label: 'pnpm', cmd: 'pnpm add truncate' },
  { label: 'bun', cmd: 'bun add truncate' },
  { label: 'npm', cmd: 'npm install truncate' },
  { label: 'yarn', cmd: 'yarn add truncate' },
]

const QUICK = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!'
const LONG = 'Typography is the visual component of the written word. A text must be readable and legible. But more than that, it should convey the tone and voice of the message. The choice of typeface, the spacing between letters and lines, the measure of the column. All of these elements work together to create an experience for the reader. In digital interfaces, truncation becomes a necessary tool when this carefully crafted text exceeds its container. Good truncation preserves meaning while respecting layout constraints.'
const CJK = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光'
const URL = 'https://github.com/tonyblu331/truncate/blob/main/src/truncate.ts'

const SCENARIOS = [
  { id: 'width', label: 'Width' },
  { id: 'lines', label: 'Lines' },
  { id: 'ellipsis', label: 'Ellipsis' },
  { id: 'cjk', label: 'CJK' },
  { id: 'middle', label: 'Middle' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'factory', label: 'Factory' },
]

const RANGE_CLS = 'w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer'
const BTN_CLS = 'font-mono text-s px-3 py-1.5 ring-1 ring-base/20 text-base no-underline cursor-pointer hover:bg-base hover:text-surface transition-colors'

function Section({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-24">
      <h2 className="mb-1 ring-0 ring-b-base/10 ring-b-1 pb-1 text-l leading-heading text-base text-balance">{title}</h2>
      <p className="text-s text-base/50 leading-body mb-6">{desc}</p>
      {children}
    </section>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-24" aria-hidden>
      <hr className="flex-1 ring-0 ring-t-base/10 ring-t-1" />
      <span className="font-mono text-s text-base/20 select-none">...</span>
      <hr className="flex-1 ring-0 ring-t-base/10 ring-t-1" />
    </div>
  )
}

function SliderControl({ label, value, onChange, min, max, suffix = '' }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; suffix?: string
}) {
  const id = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-s uppercase text-base/50">{label}</label>
      <div className="flex items-center gap-2">
        <input id={id} type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
          className={RANGE_CLS} aria-label={label} />
        <span className="font-mono text-s text-base">{value}{suffix}</span>
      </div>
    </div>
  )
}

function ResultBox({ children, stats }: { children: React.ReactNode; stats?: string }) {
  return (
    <div className="p-4 mt-4 ring-1 ring-base/10 min-h-12">
      <div className="font-sans text-m leading-body break-words">{children}</div>
      {stats && <div className="font-mono text-s text-base/40 mt-1">{stats}</div>}
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative mt-4 font-mono text-s leading-relaxed ring-1 ring-base/10">
      <button type="button" onClick={handle} className="absolute top-2 right-2 font-mono text-s px-2 py-1 text-base/40 hover:text-base">
        {copied ? 'copied' : 'copy'}
      </button>
      <pre className="p-4 overflow-x-auto"><code>{code}</code></pre>
    </div>
  )
}

function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export default function Playground() {
  const font = useDetectFont()

  const [t1, setT1] = useState(QUICK)
  const [w1, setW1] = useState(350)
  const r1 = font ? truncateByWidth(t1, { font, maxWidth: w1 }) : ''

  const [t2, setT2] = useState(LONG)
  const [w2, setW2] = useState(400)
  const [l2, setL2] = useState(3)
  const [lh2, setLh2] = useState(28)
  const r2 = font ? truncateByLines(t2, { font, maxWidth: w2, lineHeight: lh2, maxLines: l2 }) : ''
  const h2 = font ? measureHeight(t2, { font, maxWidth: w2, lineHeight: lh2 }) : 0

  const [t3, setT3] = useState(QUICK)
  const [e3, setE3] = useState('…')
  const [w3, setW3] = useState(300)
  const r3 = font ? truncateByWidth(t3, { font, maxWidth: w3, ellipsis: e3 }) : ''

  const [t4, setT4] = useState(CJK)
  const [w4, setW4] = useState(200)
  const r4n = font ? truncateByWidth(t4, { font, maxWidth: w4 }) : ''
  const r4k = font ? truncateByWidth(t4, { font, maxWidth: w4, wordBreak: 'keep-all' }) : ''

  const [t5, setT5] = useState(URL)
  const [w5, setW5] = useState(200)
  const r5 = font ? truncateMiddle(t5, { font, maxWidth: w5 }) : ''

  const [t6, setT6] = useState(QUICK)
  const [w6, setW6] = useState(350)
  const [s6, setS6] = useState(3)
  const r6 = font ? truncateByWidth(t6, { font, maxWidth: w6, letterSpacing: s6 }) : ''

  const [w7, setW7] = useState(400)
  const [l7, setL7] = useState(2)
  const T = font ? createTruncator({ font, lineHeight: 28 }) : null
  const r7 = T ? T.truncateByLines(LONG, { maxWidth: w7, maxLines: l7 }) : ''

  if (!font) return null

  return (
    <div>
      {/* hero */}
      <header className="pt-24 pb-8 mb-16 ring-0 ring-b-base/10 ring-b-1">
        <h1 className="text-l leading-heading text-base mb-1 text-balance">Truncate</h1>
        <p className="text-s text-base/50 leading-body mb-6">
          Dom-free text truncation. Measure text by pixel width or line count, powered by Pretext.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {INSTALL.map(({ label, cmd }) => (
            <button key={label} type="button" onClick={() => navigator.clipboard.writeText(cmd)}
              className={BTN_CLS}>
              <span className="text-base/30">$</span> {cmd}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-s font-mono text-base/40">
          <span>Bundle ~1 kB gzip</span>
          <span className="text-base/20">/</span>
          <a href="https://github.com/tonyblu331/truncate?tab=readme-ov-file#api" target="_blank" rel="noreferrer" className="text-base underline underline-offset-2 hover:text-base/50">Docs</a>
          <span className="text-base/20">/</span>
          <a href="https://github.com/tonyblu331/truncate" target="_blank" rel="noreferrer" className="text-base underline underline-offset-2 hover:text-base/50">GitHub</a>
        </div>
      </header>

      {/* nav */}
      <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-16 text-s font-mono" aria-label="Demos">
        {SCENARIOS.map(s => (
          <a key={s.id} href={`#${s.id}`} className="text-base underline underline-offset-2 hover:text-base/50">{s.label}</a>
        ))}
      </nav>

      {/* 1. Width truncation */}
      <Section id="width" title="Width truncation" desc="Truncate text to fit a pixel width on a single line. Measures each prefix, appends an ellipsis on overflow.">
        <textarea value={t1} onChange={e => setT1(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 ring-1 ring-base/10 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w1} onChange={setW1} min={50} max={600} suffix="px" />
        </div>
        <ResultBox stats={`${r1.length} chars — ${r1.includes('…') ? 'truncated' : 'fits'}`}>{r1}</ResultBox>
        <CodeBlock code={`truncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w1} }\n)`} />
      </Section>

      <Divider />

      {/* 2. Multi-line */}
      <Section id="lines" title="Multi-line truncation" desc="Truncate text within N lines. Full lines above, truncated last line below.">
        <textarea value={t2} onChange={e => setT2(e.target.value)} rows={3}
          className="w-full font-sans text-m leading-body p-3 ring-1 ring-base/10 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w2} onChange={setW2} min={200} max={700} suffix="px" />
          <SliderControl label="Max lines" value={l2} onChange={setL2} min={1} max={10} />
          <SliderControl label="Line height" value={lh2} onChange={setLh2} min={16} max={48} suffix="px" />
        </div>
        <ResultBox stats={`${r2.split('\n').length} lines — full height: ${h2}px — truncated: ${r2.includes('…') ? 'yes' : 'no'}`}>{r2}</ResultBox>
        <CodeBlock code={`truncateByLines(\n  ${JSON.stringify(short(t2))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w2}, lineHeight: ${lh2}, maxLines: ${l2} }\n)`} />
      </Section>

      <Divider />

      {/* 3. Custom ellipsis */}
      <Section id="ellipsis" title="Custom ellipsis" desc="Replace the default ellipsis with any string. Useful for localization, show more links, or editorial style guides.">
        <textarea value={t3} onChange={e => setT3(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 ring-1 ring-base/10 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w3} onChange={setW3} min={50} max={600} suffix="px" />
          <div className="flex flex-col gap-1">
            <label htmlFor="ellipsis-input" className="font-mono text-s uppercase text-base/50">Ellipsis</label>
            <input id="ellipsis-input" type="text" value={e3} onChange={e => setE3(e.target.value)}
              className="font-mono text-s px-2 py-1 ring-1 ring-base/10 text-base w-32 focus:outline-none focus:ring-2" aria-label="Ellipsis text" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {['…', ' ➡', ' 👉', ' [more]', ' ...'].map(ell => (
            <button key={ell} type="button" onClick={() => setE3(ell)}
              className={`${BTN_CLS} ${e3 === ell ? 'bg-base text-surface' : ''}`}>{ell || 'empty'}</button>
          ))}
        </div>
        <ResultBox stats={`ellipsis: ${JSON.stringify(e3)}`}>{r3}</ResultBox>
        <CodeBlock code={`truncateByWidth(\n  ${JSON.stringify(short(t3))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w3}, ellipsis: ${JSON.stringify(e3)} }\n)`} />
      </Section>

      <Divider />

      {/* 4. CJK */}
      <Section id="cjk" title="CJK word break" desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs keep-all on the same text.">
        <textarea value={t4} onChange={e => setT4(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 ring-1 ring-base/10 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w4} onChange={setW4} min={50} max={500} suffix="px" />
        </div>
        <div className="p-4 mt-4 ring-1 ring-base/10">
          <div className="font-mono text-s text-base/40 mb-1">Normal</div>
          <div className="font-sans text-m leading-body break-words">{r4n}</div>
          <div className="font-mono text-s text-base/40 mt-3 mb-1">Keep all</div>
          <div className="font-sans text-m leading-body break-words">{r4k}</div>
        </div>
        <CodeBlock code={`// normal\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w4} }\n)\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w4}, wordBreak: "keep-all" }\n)`} />
      </Section>

      <Divider />

      {/* 5. Middle truncation */}
      <Section id="middle" title="Middle truncation" desc="Truncate text in the middle, keeping both start and end. Ideal for URLs, file paths, and account identifiers.">
        <textarea value={t5} onChange={e => setT5(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 ring-1 ring-base/10 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w5} onChange={setW5} min={50} max={600} suffix="px" />
        </div>
        <ResultBox stats={`${r5.length} chars — ${r5.includes('…') ? 'truncated' : 'fits'}`}>{r5}</ResultBox>
        <CodeBlock code={`truncateMiddle(\n  ${JSON.stringify(short(t5))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w5} }\n)`} />
      </Section>

      <Divider />

      {/* 6. Letter spacing */}
      <Section id="spacing" title="Letter spacing" desc="Pass letterSpacing in CSS px to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner.">
        <textarea value={t6} onChange={e => setT6(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 ring-1 ring-base/10 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w6} onChange={setW6} min={50} max={600} suffix="px" />
          <SliderControl label="Letter spacing" value={s6} onChange={setS6} min={0} max={12} suffix="px" />
        </div>
        <ResultBox stats={`letter-spacing: ${s6}px`}>
          <span style={{ letterSpacing: s6 + 'px' }}>{r6}</span>
        </ResultBox>
        <CodeBlock code={`truncateByWidth(\n  ${JSON.stringify(short(t6))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w6}, letterSpacing: ${s6} }\n)`} />
      </Section>

      <Divider />

      {/* 7. Factory */}
      <Section id="factory" title="Create truncator factory" desc="Pre-configure font and defaults with createTruncator. All methods inherit the config, no repetition.">
        <div className="flex flex-wrap gap-4 mt-4">
          <SliderControl label="Max width" value={w7} onChange={setW7} min={200} max={700} suffix="px" />
          <SliderControl label="Max lines" value={l7} onChange={setL7} min={1} max={8} />
        </div>
        <ResultBox stats={`via createTruncator({ font, lineHeight: 28 })`}>{r7}</ResultBox>
        <CodeBlock code={`const t = createTruncator({\n  font: ${JSON.stringify(font)},\n  lineHeight: 28,\n})\n\nt.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w7}, maxLines: ${l7} }\n)`} />
      </Section>
    </div>
  )
}

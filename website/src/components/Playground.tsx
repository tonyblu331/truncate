import { useState, type ReactNode } from 'react'
import { truncateByWidth, truncateByLines, truncateMiddle, measureHeight, createTruncator, detectFont, register } from 'truncate'

detectFont()

register('body', { font: '18px Geist' })
register('h1', { font: '26px Geist' })
register('code', { font: '13px Geist Mono' })

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
  { id: 'cjk', label: 'Cjk' },
  { id: 'middle', label: 'Middle' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'factory', label: 'Factory' },
]

const RANGE_CLS = 'w-40 h-px appearance-none bg-base/35 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer'
const BTN_CLS = 'font-mono text-s px-3 py-1.5 ring-1 ring-base/15 text-base no-underline cursor-pointer hover:bg-base hover:text-surface transition-colors'

type Role = 'primary' | 'secondary' | 'dim'
type Sz = 's' | 'm' | 'l'

const roleCls: Record<Role, string> = { primary: 'text-base', secondary: 'text-dim', dim: 'text-dim' }
const szCls: Record<Sz, string> = { s: 'text-s', m: 'text-m', l: 'text-l' }

function T({ role = 'primary', size = 'm', mono = false, as: Tag = 'span', className = '', children }: {
  role?: Role; size?: Sz; mono?: boolean; as?: 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2'; className?: string; children: ReactNode
}) {
  return <Tag className={`${szCls[size]} ${roleCls[role]} ${mono ? 'font-mono' : 'font-sans'} ${className}`}>{children}</Tag>
}

function Section({ id, title, desc, children }: { id: string; title: string; desc: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-24">
      <T as="h2" size="l" className="mb-1 ring-0 ring-b-base/15 ring-b-1 pb-1 leading-heading text-balance">{title}</T>
      <T role="secondary" size="m" as="p" className="leading-body mb-6">{desc}</T>
      {children}
    </section>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-24 select-none" aria-hidden>
      <hr className="flex-1 ring-0 ring-t-base/15 ring-t-1" />
      <T size="s" className="text-base select-none">...</T>
      <hr className="flex-1 ring-0 ring-t-base/15 ring-t-1" />
    </div>
  )
}

function Slider({ label, value, onChange, min, max, suffix = '' }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; suffix?: string
}) {
  const id = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-s text-dim uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <input id={id} type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
          className={RANGE_CLS} aria-label={label} />
        <span className="font-mono text-s text-base">{value}{suffix}</span>
      </div>
    </div>
  )
}

function Result({ children, stats }: { children: ReactNode; stats?: string }) {
  return (
    <div className="p-4 mt-4 ring-1 ring-base/15 min-h-12">
      <T size="m" className="leading-body break-words">{children}</T>
      {stats && <T role="dim" size="s" mono className="mt-1">{stats}</T>}
    </div>
  )
}

function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative mt-4 font-mono text-s leading-relaxed ring-1 ring-base/15">
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="absolute top-2 right-2 font-mono text-s px-2 py-1 text-dim hover:text-base">
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
  const [t1, setT1] = useState(QUICK)
  const [w1, setW1] = useState(350)
  const r1 = truncateByWidth(t1, { maxWidth: w1 })

  const [t2, setT2] = useState(LONG)
  const [w2, setW2] = useState(400)
  const [l2, setL2] = useState(3)
  const [lh2, setLh2] = useState(28)
  const r2 = truncateByLines(t2, { maxWidth: w2, lineHeight: lh2, maxLines: l2 })
  const h2 = measureHeight(t2, { maxWidth: w2, lineHeight: lh2 })

  const [t3, setT3] = useState(QUICK)
  const [e3, setE3] = useState('…')
  const [w3, setW3] = useState(300)
  const r3 = truncateByWidth(t3, { maxWidth: w3, ellipsis: e3 })

  const [t4, setT4] = useState(CJK)
  const [w4, setW4] = useState(200)
  const r4n = truncateByWidth(t4, { maxWidth: w4 })
  const r4k = truncateByWidth(t4, { maxWidth: w4, wordBreak: 'keep-all' })

  const [t5, setT5] = useState(URL)
  const [w5, setW5] = useState(200)
  const r5 = truncateMiddle(t5, { maxWidth: w5 })

  const [t6, setT6] = useState(QUICK)
  const [w6, setW6] = useState(350)
  const [s6, setS6] = useState(3)
  const r6 = truncateByWidth(t6, { maxWidth: w6, letterSpacing: s6 })

  const [w7, setW7] = useState(400)
  const [l7, setL7] = useState(2)
  const Tfac = createTruncator({ selector: 'body', lineHeight: 28 })
  const r7 = Tfac.truncateByLines(LONG, { maxWidth: w7, maxLines: l7 })

  return (
    <div>
      <header className="pt-24 pb-8 mb-16 ring-0 ring-b-base/15 ring-b-1">
        <T as="h1" size="l" className="mb-1 leading-heading text-balance">Truncate</T>
        <T role="secondary" size="m" as="p" className="leading-body mb-6">
          Dom-free text truncation. Measure text by pixel width or line count. No font ceremony, auto-detect from the page.
        </T>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {INSTALL.map(({ label, cmd }) => (
            <button key={label} type="button" onClick={() => navigator.clipboard.writeText(cmd)} className={BTN_CLS}>
              <T role="dim" as="span" size="s" mono>$</T>{' '}{cmd}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <T role="dim" size="s" mono>Bundle ~1.5 kB gzip</T>
          <T role="dim" size="s" mono className="text-base/15">/</T>
          <a href="https://github.com/tonyblu331/truncate?tab=readme-ov-file#api" target="_blank" rel="noreferrer">
            <T role="secondary" size="s" mono as="span" className="underline underline-offset-2 hover:text-base">Docs</T>
          </a>
          <T role="dim" size="s" mono className="text-base/15">/</T>
          <a href="https://github.com/tonyblu331/truncate" target="_blank" rel="noreferrer">
            <T role="secondary" size="s" mono as="span" className="underline underline-offset-2 hover:text-base">GitHub</T>
          </a>
        </div>
      </header>

      <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-16" aria-label="Demos">
        {SCENARIOS.map(s => (
          <a key={s.id} href={`#${s.id}`} className="underline underline-offset-2">
            <T role="secondary" size="s" mono as="span" className="hover:text-base">{s.label}</T>
          </a>
        ))}
      </nav>

      <Section id="width" title="Width truncation" desc="Truncate text to fit a pixel width on a single line. Measures each prefix, appends an ellipsis on overflow.">
        <textarea value={t1} onChange={e => setT1(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w1} onChange={setW1} min={50} max={600} suffix="px" />
        </div>
        <Result stats={`${r1.length} chars - ${r1.includes('…') ? 'truncated' : 'fits'}`}>{r1}</Result>
        <Code code={`truncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { maxWidth: ${w1} }\n)`} />
      </Section>

      <Divider />

      <Section id="lines" title="Multi-line truncation" desc="Truncate text within N lines. Full lines above, truncated last line below.">
        <textarea value={t2} onChange={e => setT2(e.target.value)} rows={3}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w2} onChange={setW2} min={200} max={700} suffix="px" />
          <Slider label="Max lines" value={l2} onChange={setL2} min={1} max={10} />
          <Slider label="Line height" value={lh2} onChange={setLh2} min={16} max={48} suffix="px" />
        </div>
        <Result stats={`${r2.split('\n').length} lines - full height: ${h2}px - truncated: ${r2.includes('…') ? 'yes' : 'no'}`}>{r2}</Result>
        <Code code={`truncateByLines(\n  ${JSON.stringify(short(t2))},\n  { maxWidth: ${w2}, lineHeight: ${lh2}, maxLines: ${l2} }\n)`} />
      </Section>

      <Divider />

      <Section id="ellipsis" title="Custom ellipsis" desc="Replace the default ellipsis with any string. Useful for localization, show more links, or editorial style guides.">
        <textarea value={t3} onChange={e => setT3(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w3} onChange={setW3} min={50} max={600} suffix="px" />
          <div className="flex flex-col gap-1">
            <label htmlFor="ellipsis-input" className="font-mono text-s text-dim uppercase">Ellipsis</label>
            <input id="ellipsis-input" type="text" value={e3} onChange={e => setE3(e.target.value)}
              className="font-mono text-s px-2 py-1 ring-1 ring-base/15 text-base w-32 focus:outline-none focus:ring-2 bg-surface" aria-label="Ellipsis text" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {['…', ' ➡', ' 👉', ' [more]', ' ...'].map(ell => (
            <button key={ell} type="button" onClick={() => setE3(ell)}
              className={`font-mono text-s px-3 py-1.5 ring-1 ring-base/15 text-base cursor-pointer hover:bg-base hover:text-surface transition-colors ${e3 === ell ? 'bg-base text-surface' : 'bg-surface'}`}>{ell || 'empty'}</button>
          ))}
        </div>
        <Result stats={`ellipsis: ${JSON.stringify(e3)}`}>{r3}</Result>
        <Code code={`truncateByWidth(\n  ${JSON.stringify(short(t3))},\n  { maxWidth: ${w3}, ellipsis: ${JSON.stringify(e3)} }\n)`} />
      </Section>

      <Divider />

      <Section id="cjk" title="Cjk word break" desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs keep-all on the same text.">
        <textarea value={t4} onChange={e => setT4(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w4} onChange={setW4} min={50} max={500} suffix="px" />
        </div>
        <div className="p-4 mt-4 ring-1 ring-base/15">
          <T role="dim" size="s" mono className="mb-1">Normal</T>
          <T size="m" className="leading-body break-words mb-3">{r4n}</T>
          <T role="dim" size="s" mono className="mb-1">Keep all</T>
          <T size="m" className="leading-body break-words">{r4k}</T>
        </div>
        <Code code={`// normal\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { maxWidth: ${w4} }\n)\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { maxWidth: ${w4}, wordBreak: "keep-all" }\n)`} />
      </Section>

      <Divider />

      <Section id="middle" title="Middle truncation" desc="Truncate text in the middle, keeping both start and end. Ideal for URLs, file paths, and account identifiers.">
        <textarea value={t5} onChange={e => setT5(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w5} onChange={setW5} min={50} max={600} suffix="px" />
        </div>
        <Result stats={`${r5.length} chars - ${r5.includes('…') ? 'truncated' : 'fits'}`}>{r5}</Result>
        <Code code={`truncateMiddle(\n  ${JSON.stringify(short(t5))},\n  { maxWidth: ${w5} }\n)`} />
      </Section>

      <Divider />

      <Section id="spacing" title="Letter spacing" desc="Pass letterSpacing in CSS px to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner.">
        <textarea value={t6} onChange={e => setT6(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y [field-sizing:content] min-h-[4lh] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w6} onChange={setW6} min={50} max={600} suffix="px" />
          <Slider label="Letter spacing" value={s6} onChange={setS6} min={0} max={12} suffix="px" />
        </div>
        <Result stats={`letter-spacing: ${s6}px`}>
          <span style={{ letterSpacing: s6 + 'px' }}>{r6}</span>
        </Result>
        <Code code={`truncateByWidth(\n  ${JSON.stringify(short(t6))},\n  { maxWidth: ${w6}, letterSpacing: ${s6} }\n)`} />
      </Section>

      <Divider />

      <Section id="factory" title="Truncator factory" desc="Pre-configure defaults via createTruncator. All methods inherit the config. Registry-based selectors resolve fonts globally.">
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w7} onChange={setW7} min={200} max={700} suffix="px" />
          <Slider label="Max lines" value={l7} onChange={setL7} min={1} max={8} />
        </div>
        <Result stats={`via createTruncator({ selector: 'body', lineHeight: 28 })`}>{r7}</Result>
        <Code code={`const t = createTruncator({\n  selector: 'body',\n  lineHeight: 28,\n})\n\nt.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w7}, maxLines: ${l7} }\n)`} />
      </Section>
    </div>
  )
}

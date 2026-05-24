import { useState, type ReactNode } from 'react'
import { truncateByWidth, truncateByLines, truncateStart, truncateMiddle, measureHeight, createTruncator, detectFont, register } from 'truncate'

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
  { id: 'position', label: 'Position' },
  { id: 'cjk', label: 'Cjk' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'factory', label: 'Factory' },
]

const RANGE_CLS = 'w-40 h-px appearance-none bg-base/35 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer'
const BTN_CLS = 'font-mono text-s px-3 py-1.5 ring-1 ring-base/15 text-base no-underline cursor-pointer hover:bg-base hover:text-surface transition-colors'
const RADIO_CLS = 'appearance-none w-3 h-3 rounded-full ring-1 ring-base mr-1.5 cursor-pointer checked:bg-base'

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
    <div className="flex items-center gap-4 mb-24 select-none" aria-hidden>
      <hr className="flex-1 ring-0 ring-t-base/15 ring-t-1" />
      <T size="m" className="text-base/85 tracking-[0.2em] select-none">...</T>
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

function Result({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 mt-4 ring-1 ring-base/15 min-h-12">
      <T size="m" className="leading-body break-words">{children}</T>
    </div>
  )
}

function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative mt-4">
      <pre className="font-mono text-s leading-relaxed ring-1 ring-base/15 p-4 pt-8 overflow-x-auto">
        <button type="button" onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="absolute -top-px right-0 font-mono text-s px-2 py-0.5 ring-1 ring-base bg-surface text-base hover:bg-base hover:text-surface">
          {copied ? 'copied' : 'copy'}
        </button>
        <code>{code}</code>
      </pre>
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

  const [tp, setTp] = useState(QUICK)
  const [wp, setWp] = useState(300)
  const [ep, setEp] = useState('…')
  const [mode, setMode] = useState<'start' | 'middle' | 'end'>('end')
  const rs = truncateStart(tp, { maxWidth: wp, ellipsis: ep })
  const rm = truncateMiddle(tp, { maxWidth: wp, ellipsis: ep })
  const re = truncateByWidth(tp, { maxWidth: wp, ellipsis: ep })

  const [t4, setT4] = useState(CJK)
  const [w4, setW4] = useState(200)
  const r4n = truncateByWidth(t4, { maxWidth: w4 })
  const r4k = truncateByWidth(t4, { maxWidth: w4, wordBreak: 'keep-all' })

  const [t5, setT5] = useState(QUICK)
  const [w5, setW5] = useState(350)
  const [s5, setS5] = useState(3)
  const r5 = truncateByWidth(t5, { maxWidth: w5, letterSpacing: s5 })

  const [w6, setW6] = useState(400)
  const [l6, setL6] = useState(2)
  const [sel, setSel] = useState('body')
  const Tfac = createTruncator({ selector: sel, lineHeight: 28 })
  const r6 = Tfac.truncateByLines(LONG, { maxWidth: w6, maxLines: l6 })

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
          <T role="dim" size="s" mono>Bundle ~1.6 kB gzip</T>
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
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w1} onChange={setW1} min={50} max={600} suffix="px" />
        </div>
        <Result>{r1}</Result>
        <Code code={`truncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { maxWidth: ${w1} }\n)`} />
      </Section>

      <Divider />

      <Section id="lines" title="Multi-line truncation" desc="Truncate text within N lines. Full lines above, truncated last line below.">
        <textarea value={t2} onChange={e => setT2(e.target.value)} rows={3}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w2} onChange={setW2} min={200} max={700} suffix="px" />
          <Slider label="Max lines" value={l2} onChange={setL2} min={1} max={10} />
          <Slider label="Line height" value={lh2} onChange={setLh2} min={16} max={48} suffix="px" />
        </div>
        <Result>{r2}</Result>
        <Code code={`truncateByLines(\n  ${JSON.stringify(short(t2))},\n  { maxWidth: ${w2}, lineHeight: ${lh2}, maxLines: ${l2} }\n)`} />
      </Section>

      <Divider />

      <Section id="position" title="Position" desc="Choose where the ellipsis goes. Start, middle, or end. Mix truncation modes with a custom ellipsis character.">
        <textarea value={tp} onChange={e => setTp(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={wp} onChange={setWp} min={50} max={600} suffix="px" />
          <div className="flex flex-col gap-1">
            <label htmlFor="ellipsis-pos" className="font-mono text-s text-dim uppercase">Ellipsis</label>
            <input id="ellipsis-pos" type="text" value={ep} onChange={e => setEp(e.target.value)}
              className="font-mono text-s px-2 py-1 ring-1 ring-base/15 text-base w-32 focus:outline-none focus:ring-2 bg-surface" aria-label="Ellipsis text" />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
          {(['start', 'middle', 'end'] as const).map(m => (
            <label key={m} className="flex items-center font-mono text-s text-dim cursor-pointer capitalize">
              <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className={RADIO_CLS} />
              {m}
            </label>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="p-3 ring-1 ring-base/15">
            <T role="dim" size="s" mono className="mr-2">Start</T>
            <T size="m" className="leading-body break-words">{rs}</T>
          </div>
          <div className="p-3 ring-1 ring-base/15">
            <T role="dim" size="s" mono className="mr-2">Middle</T>
            <T size="m" className="leading-body break-words">{rm}</T>
          </div>
          <div className="p-3 ring-1 ring-base/15">
            <T role="dim" size="s" mono className="mr-2">End</T>
            <T size="m" className="leading-body break-words">{re}</T>
          </div>
        </div>
        <Code code={`// start\ntruncateStart(\n  ${JSON.stringify(short(tp))},\n  { maxWidth: ${wp}, ellipsis: ${JSON.stringify(ep)} }\n)\n\n// middle\ntruncateMiddle(\n  ${JSON.stringify(short(tp))},\n  { maxWidth: ${wp}, ellipsis: ${JSON.stringify(ep)} }\n)\n\n// end\ntruncateByWidth(\n  ${JSON.stringify(short(tp))},\n  { maxWidth: ${wp}, ellipsis: ${JSON.stringify(ep)} }\n)`} />
      </Section>

      <Divider />

      <Section id="cjk" title="Cjk word break" desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs keep-all on the same text.">
        <textarea value={t4} onChange={e => setT4(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
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

      <Section id="spacing" title="Letter spacing" desc="Pass letterSpacing in CSS px to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner.">
        <textarea value={t5} onChange={e => setT5(e.target.value)} rows={2}
          className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface" aria-label="Sample text" />
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w5} onChange={setW5} min={50} max={600} suffix="px" />
          <Slider label="Letter spacing" value={s5} onChange={setS5} min={0} max={12} suffix="px" />
        </div>
        <Result>
          <span style={{ letterSpacing: s5 + 'px' }}>{r5}</span>
        </Result>
        <Code code={`truncateByWidth(\n  ${JSON.stringify(short(t5))},\n  { maxWidth: ${w5}, letterSpacing: ${s5} }\n)`} />
      </Section>

      <Divider />

      <Section id="factory" title="Truncator factory" desc="Pre-configure defaults via createTruncator. Toggle between registered selectors to see how font configuration affects truncation.">
        <div className="flex flex-wrap gap-4 mt-4">
          <Slider label="Max width" value={w6} onChange={setW6} min={200} max={700} suffix="px" />
          <Slider label="Max lines" value={l6} onChange={setL6} min={1} max={8} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
          {[
            { value: 'body', label: 'body', font: '18px Geist' },
            { value: 'h1', label: 'h1', font: '26px Geist' },
            { value: 'code', label: 'code', font: '13px Geist Mono' },
          ].map(s => (
            <label key={s.value} className="flex items-center font-mono text-s text-dim cursor-pointer">
              <input type="radio" name="selector" value={s.value} checked={sel === s.value} onChange={() => setSel(s.value)} className={RADIO_CLS} />
              {s.label} <T role="dim" size="s" mono as="span" className="ml-1">({s.font})</T>
            </label>
          ))}
        </div>
        <Result>{r6}</Result>
        <Code code={`register('body', { font: '18px Geist' })\nregister('h1', { font: '26px Geist' })\nregister('code', { font: '13px Geist Mono' })\n\nconst t = createTruncator({\n  selector: '${sel}',\n  lineHeight: 28,\n})\n\nt.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w6}, maxLines: ${l6} }\n)`} />
      </Section>
    </div>
  )
}

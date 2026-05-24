import { useState } from 'react'
import { truncateByWidth, truncateByLines, measureHeight, createTruncator } from 'truncate'
import { useDetectFont } from './useDetectFont'
import { CopyButton } from './CopyButton'

const INSTALL = [
  { label: 'pnpm', cmd: 'pnpm add truncate' },
  { label: 'bun', cmd: 'bun add truncate' },
  { label: 'npm', cmd: 'npm install truncate' },
  { label: 'yarn', cmd: 'yarn add truncate' },
]

const QUICK = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!'
const LONG = 'Typography is the visual component of the written word. A text must be readable and legible. But more than that, it should convey the tone and voice of the message. The choice of typeface, the spacing between letters and lines, the measure of the column. All of these elements work together to create an experience for the reader. In digital interfaces, truncation becomes a necessary tool when this carefully crafted text exceeds its container. Good truncation preserves meaning while respecting layout constraints.'
const CJK = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光'

function Sc({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="pb-1 mb-6 ring-0 ring-b-border ring-b-1 text-l leading-heading text-base">{title}</h2>
      <p className="text-s text-base/70 mb-4 leading-body">{desc}</p>
      {children}
    </section>
  )
}

function Code({ code }: { code: string }) {
  return (
    <div className="relative mt-4">
      <CopyButton text={code} className="absolute top-2 right-2 font-mono text-s px-2 py-1 bg-surface ring-1 ring-border cursor-pointer text-base hover:bg-base hover:text-surface transition-colors">
        Copy
      </CopyButton>
      <pre className="bg-muted ring-1 ring-border p-4 overflow-x-auto"><code className="font-mono text-s leading-relaxed">{code}</code></pre>
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

  const [t5, setT5] = useState(QUICK)
  const [w5, setW5] = useState(350)
  const [s5, setS5] = useState(3)
  const r5 = font ? truncateByWidth(t5, { font, maxWidth: w5, letterSpacing: s5 }) : ''

  const [w6, setW6] = useState(400)
  const [l6, setL6] = useState(2)
  const T = font ? createTruncator({ font, lineHeight: 28 }) : null
  const r6 = T ? T.truncateByLines(LONG, { maxWidth: w6, maxLines: l6 }) : ''

  if (!font) return null

  return (
    <div className="py-16">
      {/* hero */}
      <section className="pb-6 mb-12 ring-0 ring-b-border ring-b-1">
        <h1 className="text-l leading-heading text-base mb-1">Truncate</h1>
        <p className="text-s text-base/70 leading-body mb-4">
          Dom-free text truncation. Measure text by pixel width or line count, powered by Pretext.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {INSTALL.map(({ label, cmd }) => (
            <CopyButton key={label} text={cmd} className="font-mono text-s px-3 py-1.5 bg-surface ring-1 ring-border cursor-pointer transition-colors hover:bg-base hover:text-surface">
              <span>$</span> {cmd}
            </CopyButton>
          ))}
          <a href="https://github.com/tonyblu331/truncate?tab=readme-ov-file#api" className="font-mono text-s px-3 py-1.5 ring-1 ring-border text-base no-underline hover:bg-base hover:text-surface transition-colors ml-auto" target="_blank" rel="noopener">Docs ↗</a>
        </div>
      </section>

      {/* scenario 1 */}
      <Sc title="Width truncation" desc="Truncate text to fit a pixel width on a single line. Measures each prefix, appends an ellipsis on overflow.">
        <textarea value={t1} onChange={e => setT1(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 bg-surface ring-1 ring-border resize-vertical min-h-[4em] focus:outline-none focus:ring-2" />
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max width
            <div className="flex items-center gap-2">
              <input type="range" min={50} max={600} value={w1} onChange={e => setW1(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{w1}px</span>
            </div>
          </label>
        </div>
        <div className="p-4 mt-4 bg-muted ring-1 ring-border flex items-center min-h-12">
          <div>
            <div className="font-sans text-m leading-body break-words">{r1}</div>
            <div className="font-mono text-s text-base/50 mt-1">{r1.length} chars · {r1.includes('…') ? 'truncated' : 'fits'}</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\ntruncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w1} }\n)\n// → ${JSON.stringify(r1)}`} />
      </Sc>

      {/* scenario 2 */}
      <Sc title="Multi-line truncation" desc="Truncate text within N lines. Full lines above, truncated last line below.">
        <textarea value={t2} onChange={e => setT2(e.target.value)} rows={3}
          className="w-full font-sans text-m leading-body p-3 bg-surface ring-1 ring-border resize-vertical min-h-[4em] focus:outline-none focus:ring-2" />
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max width
            <div className="flex items-center gap-2">
              <input type="range" min={200} max={700} value={w2} onChange={e => setW2(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{w2}px</span>
            </div>
          </label>
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max lines
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={10} value={l2} onChange={e => setL2(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{l2}</span>
            </div>
          </label>
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Line height
            <div className="flex items-center gap-2">
              <input type="range" min={16} max={48} value={lh2} onChange={e => setLh2(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{lh2}px</span>
            </div>
          </label>
        </div>
        <div className="p-4 mt-4 bg-muted ring-1 ring-border flex items-center min-h-12">
          <div>
            <div className="font-sans text-m leading-body break-words">{r2}</div>
            <div className="font-mono text-s text-base/50 mt-1">{r2.split('\n').length} lines · full height: {h2}px · truncated: {r2.includes('…') ? 'yes' : 'no'}</div>
          </div>
        </div>
        <Code code={`import { truncateByLines } from 'truncate'\n\ntruncateByLines(\n  ${JSON.stringify(short(t2))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w2}, lineHeight: ${lh2}, maxLines: ${l2} }\n)\n// → ${JSON.stringify(r2.split('\n').length > 1 ? r2.split('\n')[0] + '\\n…' : r2)}`} />
      </Sc>

      {/* scenario 3 */}
      <Sc title="Custom ellipsis" desc="Replace the default ellipsis with any string. Useful for localization, show more links, or editorial style guides.">
        <textarea value={t3} onChange={e => setT3(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 bg-surface ring-1 ring-border resize-vertical min-h-[4em] focus:outline-none focus:ring-2" />
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max width
            <div className="flex items-center gap-2">
              <input type="range" min={50} max={600} value={w3} onChange={e => setW3(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{w3}px</span>
            </div>
          </label>
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Ellipsis
            <input type="text" value={e3} onChange={e => setE3(e.target.value)}
              className="font-mono text-s px-2 py-1 bg-surface ring-1 ring-border text-base w-32 focus:outline-none focus:ring-2" />
          </label>
        </div>
        <div className="p-4 mt-4 bg-muted ring-1 ring-border flex items-center min-h-12">
          <div>
            <div className="font-sans text-m leading-body break-words">{r3}</div>
            <div className="font-mono text-s text-base/50 mt-1">ellipsis: {JSON.stringify(e3)}</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\ntruncateByWidth(\n  ${JSON.stringify(short(t3))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w3}, ellipsis: ${JSON.stringify(e3)} }\n)\n// → ${JSON.stringify(r3)}`} />
      </Sc>

      {/* scenario 4 */}
      <Sc title="CJK word break" desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs keep-all on the same text.">
        <textarea value={t4} onChange={e => setT4(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 bg-surface ring-1 ring-border resize-vertical min-h-[4em] focus:outline-none focus:ring-2" />
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max width
            <div className="flex items-center gap-2">
              <input type="range" min={50} max={500} value={w4} onChange={e => setW4(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{w4}px</span>
            </div>
          </label>
        </div>
        <div className="p-4 mt-4 bg-muted ring-1 ring-border flex items-center min-h-12">
          <div>
            <div className="font-mono text-s text-base/50 mb-1">Normal</div>
            <div className="font-sans text-m leading-body break-words">{r4n}</div>
            <div className="font-mono text-s text-base/50 mt-3 mb-1">Keep all</div>
            <div className="font-sans text-m leading-body break-words">{r4k}</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\n// normal (default)\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w4} }\n)\n// → ${JSON.stringify(r4n)}\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w4}, wordBreak: "keep-all" }\n)\n// → ${JSON.stringify(r4k)}`} />
      </Sc>

      {/* scenario 5 */}
      <Sc title="Letter spacing" desc="Pass letterSpacing in CSS px to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner.">
        <textarea value={t5} onChange={e => setT5(e.target.value)} rows={2}
          className="w-full font-sans text-m leading-body p-3 bg-surface ring-1 ring-border resize-vertical min-h-[4em] focus:outline-none focus:ring-2" />
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max width
            <div className="flex items-center gap-2">
              <input type="range" min={50} max={600} value={w5} onChange={e => setW5(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{w5}px</span>
            </div>
          </label>
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Letter spacing
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={12} value={s5} onChange={e => setS5(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{s5}px</span>
            </div>
          </label>
        </div>
        <div className="p-4 mt-4 bg-muted ring-1 ring-border flex items-center min-h-12">
          <div>
            <div className="font-sans text-m leading-body break-words" style={{ letterSpacing: s5 + 'px' }}>{r5}</div>
            <div className="font-mono text-s text-base/50 mt-1">letter-spacing: {s5}px</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\ntruncateByWidth(\n  ${JSON.stringify(short(t5))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w5}, letterSpacing: ${s5} }\n)\n// → ${JSON.stringify(r5)}`} />
      </Sc>

      {/* scenario 6 */}
      <Sc title="Create truncator factory" desc="Pre-configure font and defaults with createTruncator. All methods inherit the config, no repetition.">
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max width
            <div className="flex items-center gap-2">
              <input type="range" min={200} max={700} value={w6} onChange={e => setW6(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{w6}px</span>
            </div>
          </label>
          <label className="flex flex-col gap-1 font-mono text-s uppercase text-base/70">
            Max lines
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={8} value={l6} onChange={e => setL6(+e.target.value)}
                className="w-40 h-px appearance-none bg-base/30 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer" />
              <span className="font-mono text-s text-base">{l6}</span>
            </div>
          </label>
        </div>
        <div className="p-4 mt-4 bg-muted ring-1 ring-border flex items-center min-h-12">
          <div>
            <div className="font-sans text-m leading-body break-words">{r6}</div>
            <div className="font-mono text-s text-base/50 mt-1">via createTruncator({' font, lineHeight: 28 '})</div>
          </div>
        </div>
        <Code code={`import { createTruncator } from 'truncate'\n\nconst t = createTruncator({\n  font: ${JSON.stringify(font)},\n  lineHeight: 28,\n})\n\nt.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w6}, maxLines: ${l6} }\n)\n// → ${JSON.stringify(r6.split('\n').length > 1 ? r6.split('\n')[0] + '\\n…' : r6)}`} />
      </Sc>
    </div>
  )
}

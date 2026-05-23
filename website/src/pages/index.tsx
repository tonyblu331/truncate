import { useState } from 'react'
import { truncateByWidth, truncateByLines, measureHeight, createTruncator } from 'truncate'
import { useDetectFont } from '../components/useDetectFont'
import { CopyButton } from '../components/CopyButton'

const INSTALL = [
  { label: 'pnpm', cmd: 'pnpm add truncate' },
  { label: 'bun', cmd: 'bun add truncate' },
  { label: 'npm', cmd: 'npm install truncate' },
  { label: 'yarn', cmd: 'yarn add truncate' },
]

const LOREM = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!'
const LONG = 'Typography is the visual component of the written word. A text must be readable and legible — but more than that, it should convey the tone and voice of the message. The choice of typeface, the spacing between letters and lines, the measure of the column — all of these elements work together to create an experience for the reader. In digital interfaces, truncation becomes a necessary tool when this carefully crafted text exceeds its container. Good truncation preserves meaning while respecting layout constraints.'
const CJK = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光'

function Scenario({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="scenario">
      <h2>{title}</h2>
      <p>{desc}</p>
      {children}
    </section>
  )
}

function Code({ code }: { code: string }) {
  return (
    <div className="code-block">
      <CopyButton text={code} className="copy-btn">copy</CopyButton>
      <pre><code>{code}</code></pre>
    </div>
  )
}

function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export default function Home() {
  const font = useDetectFont()

  const [t1, setT1] = useState(LOREM)
  const [w1, setW1] = useState(350)
  const r1 = font ? truncateByWidth(t1, { font, maxWidth: w1 }) : ''

  const [t2, setT2] = useState(LONG)
  const [w2, setW2] = useState(400)
  const [l2, setL2] = useState(3)
  const [lh2, setLh2] = useState(28)
  const r2 = font ? truncateByLines(t2, { font, maxWidth: w2, lineHeight: lh2, maxLines: l2 }) : ''
  const h2 = font ? measureHeight(t2, { font, maxWidth: w2, lineHeight: lh2 }) : 0

  const [t3, setT3] = useState(LOREM)
  const [e3, setE3] = useState('…')
  const [w3, setW3] = useState(300)
  const r3 = font ? truncateByWidth(t3, { font, maxWidth: w3, ellipsis: e3 }) : ''

  const [t4, setT4] = useState(CJK)
  const [w4, setW4] = useState(200)
  const r4n = font ? truncateByWidth(t4, { font, maxWidth: w4 }) : ''
  const r4k = font ? truncateByWidth(t4, { font, maxWidth: w4, wordBreak: 'keep-all' }) : ''

  const [t5, setT5] = useState(LOREM)
  const [w5, setW5] = useState(350)
  const [s5, setS5] = useState(3)
  const r5 = font ? truncateByWidth(t5, { font, maxWidth: w5, letterSpacing: s5 }) : ''

  const [w6, setW6] = useState(400)
  const [l6, setL6] = useState(2)
  const T = font ? createTruncator({ font, lineHeight: 28 }) : null
  const r6 = T ? T.truncateByLines(LONG, { maxWidth: w6, maxLines: l6 }) : ''

  if (!font) return null

  return (
    <div>
      <section className="hero">
        <h1>truncate</h1>
        <p>DOM-free text truncation powered by Pretext. Measure &amp; truncate text by pixel width or line count &mdash; no browser layout, no flickering, no guesswork.</p>
        <div className="install-bar">
          {INSTALL.map(({ label, cmd }) => (
            <CopyButton key={label} text={cmd}>
              <code>$ {cmd}</code>
            </CopyButton>
          ))}
          <a href="https://github.com/tonyblu331/truncate?tab=readme-ov-file#api" className="docs-link" target="_blank" rel="noopener">Read docs ↗</a>
        </div>
      </section>

      <Scenario title="01 / width truncation" desc="Truncate text to fit within a given pixel width on a single line. The library measures each candidate prefix and appends an ellipsis only when the text overflows.">
        <div className="text-input-area">
          <textarea value={t1} onChange={e => setT1(e.target.value)} rows={2} />
        </div>
        <div className="playground-controls">
          <label>maxWidth<input type="range" min={50} max={600} value={w1} onChange={e => setW1(+e.target.value)} /><span className="value">{w1}px</span></label>
        </div>
        <div className="result-box">
          <div>
            <div className="result-text">{r1}</div>
            <div className="stats">{r1.length} chars · {r1.includes('…') ? 'truncated' : 'fits'}</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\ntruncateByWidth(\n  ${JSON.stringify(short(t1))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w1} }\n)\n// → ${JSON.stringify(r1)}`} />
      </Scenario>

      <Scenario title="02 / multi-line truncation" desc="Truncate text to fit within N lines. The library finds the exact break point: full lines above, truncated last line below.">
        <div className="text-input-area">
          <textarea value={t2} onChange={e => setT2(e.target.value)} rows={3} />
        </div>
        <div className="playground-controls">
          <label>maxWidth<input type="range" min={200} max={700} value={w2} onChange={e => setW2(+e.target.value)} /><span className="value">{w2}px</span></label>
          <label>maxLines<input type="range" min={1} max={10} value={l2} onChange={e => setL2(+e.target.value)} /><span className="value">{l2}</span></label>
          <label>lineHeight<input type="range" min={16} max={48} value={lh2} onChange={e => setLh2(+e.target.value)} /><span className="value">{lh2}px</span></label>
        </div>
        <div className="result-box">
          <div>
            <div className="result-text">{r2}</div>
            <div className="stats">{r2.split('\n').length} lines · full height: {h2}px · truncated: {r2.includes('…') ? 'yes' : 'no'}</div>
          </div>
        </div>
        <Code code={`import { truncateByLines } from 'truncate'\n\ntruncateByLines(\n  ${JSON.stringify(short(t2))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w2}, lineHeight: ${lh2}, maxLines: ${l2} }\n)\n// → ${JSON.stringify(r2.split('\n').length > 1 ? r2.split('\n')[0] + '\\n…' : r2)}`} />
      </Scenario>

      <Scenario title="03 / custom ellipsis" desc="Replace the default ellipsis character with any string — useful for localization, 'show more' links, or editorial style guides.">
        <div className="text-input-area">
          <textarea value={t3} onChange={e => setT3(e.target.value)} rows={2} />
        </div>
        <div className="playground-controls">
          <label>maxWidth<input type="range" min={50} max={600} value={w3} onChange={e => setW3(+e.target.value)} /><span className="value">{w3}px</span></label>
          <label>ellipsis<input type="text" value={e3} onChange={e => setE3(e.target.value)} /></label>
        </div>
        <div className="result-box">
          <div>
            <div className="result-text">{r3}</div>
            <div className="stats">ellipsis: {JSON.stringify(e3)}</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\ntruncateByWidth(\n  ${JSON.stringify(short(t3))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w3}, ellipsis: ${JSON.stringify(e3)} }\n)\n// → ${JSON.stringify(r3)}`} />
      </Scenario>

      <Scenario title="04 / CJK word-break" desc="Pretext supports wordBreak keep-all, preventing breaks inside CJK and Hangul runs. Compare normal vs. keep-all behaviour on the same text.">
        <div className="text-input-area">
          <textarea value={t4} onChange={e => setT4(e.target.value)} rows={2} />
        </div>
        <div className="playground-controls">
          <label>maxWidth<input type="range" min={50} max={500} value={w4} onChange={e => setW4(+e.target.value)} /><span className="value">{w4}px</span></label>
        </div>
        <div className="result-box">
          <div>
            <div className="stats" style={{ marginBottom: '0.25rem' }}>normal</div>
            <div className="result-text">{r4n}</div>
            <div className="stats" style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }}>keep-all</div>
            <div className="result-text">{r4k}</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\n// normal (default)\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w4} }\n)\n// → ${JSON.stringify(r4n)}\n\n// keep-all\ntruncateByWidth(\n  ${JSON.stringify(short(t4))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w4}, wordBreak: "keep-all" }\n)\n// → ${JSON.stringify(r4k)}`} />
      </Scenario>

      <Scenario title="05 / letter-spacing" desc="Pass letterSpacing (in CSS px) to match your design. Wider spacing makes text take up more horizontal room, so truncation kicks in sooner.">
        <div className="text-input-area">
          <textarea value={t5} onChange={e => setT5(e.target.value)} rows={2} />
        </div>
        <div className="playground-controls">
          <label>maxWidth<input type="range" min={50} max={600} value={w5} onChange={e => setW5(+e.target.value)} /><span className="value">{w5}px</span></label>
          <label>letterSpacing<input type="range" min={0} max={12} value={s5} onChange={e => setS5(+e.target.value)} /><span className="value">{s5}px</span></label>
        </div>
        <div className="result-box">
          <div>
            <div className="result-text" style={{ letterSpacing: s5 + 'px' }}>{r5}</div>
            <div className="stats">letter-spacing: {s5}px</div>
          </div>
        </div>
        <Code code={`import { truncateByWidth } from 'truncate'\n\ntruncateByWidth(\n  ${JSON.stringify(short(t5))},\n  { font: ${JSON.stringify(font)}, maxWidth: ${w5}, letterSpacing: ${s5} }\n)\n// → ${JSON.stringify(r5)}`} />
      </Scenario>

      <Scenario title="06 / createTruncator factory" desc="Pre-configure font and default options with createTruncator. All methods (truncateByWidth, truncateByLines, measureHeight) inherit the config — no repetition.">
        <div className="playground-controls">
          <label>maxWidth<input type="range" min={200} max={700} value={w6} onChange={e => setW6(+e.target.value)} /><span className="value">{w6}px</span></label>
          <label>maxLines<input type="range" min={1} max={8} value={l6} onChange={e => setL6(+e.target.value)} /><span className="value">{l6}</span></label>
        </div>
        <div className="result-box">
          <div>
            <div className="result-text">{r6}</div>
            <div className="stats">via createTruncator({'{'} font, lineHeight: 28 {'}'})</div>
          </div>
        </div>
        <Code code={`import { createTruncator } from 'truncate'\n\nconst t = createTruncator({\n  font: ${JSON.stringify(font)},\n  lineHeight: 28,\n})\n\nt.truncateByLines(\n  ${JSON.stringify(short(LONG))},\n  { maxWidth: ${w6}, maxLines: ${l6} }\n)\n// → ${JSON.stringify(r6.split('\n').length > 1 ? r6.split('\n')[0] + '\\n…' : r6)}`} />
      </Scenario>
    </div>
  )
}

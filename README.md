# truncate

**DOM-free** text truncation. Measure & truncate text by pixel width or line count without a browser — powered by [`@chenglou/pretext`](https://github.com/chenglou/pretext).

```bash
npm install @antonio-bonet/truncate
```

## Quick start

```ts
import { truncate, createTruncator } from "truncate"

// Auto-detect strategy based on options
truncate("A very long string", { font: "16px Inter", maxWidth: 100 })
// → "A very lo…"  (width truncation)

truncate(longArticle, { font: "16px Inter", maxWidth: 320, maxLines: 3 })
// → "First line\nSecond line\nThird li…"  (line truncation)

// Factory for repeated use
const t = createTruncator({ font: "16px Inter", lineHeight: 22 })

t.truncateByWidth("Hello", { maxWidth: 200 })
t.truncateByLines(longArticle, { maxWidth: 320, maxLines: 3 })
t.measureHeight("Hello\nworld", { maxWidth: 320 })
```

## API

### `truncate(text, options)` ★

Single entry point, auto-detects strategy:

| If `options` has… | Strategy |
|---|---|
| `maxLines` | Multi-line truncation via `truncateByLines` |
| no `maxLines` | Single-line width truncation via `truncateByWidth` |

```ts
truncate("Hello world", { font: "16px Inter", maxWidth: 100 })
truncate("Hello world", { font: "16px Inter", maxWidth: 100, maxLines: 3, lineHeight: 22 })
```

### `truncateByWidth(text, options)`

Explicit single-line width truncation.

```ts
truncateByWidth("A very long string", {
  font: "16px Inter",
  maxWidth: 100,
  ellipsis: "…",
})
```

### `truncateByLines(text, options)`

Explicit multi-line truncation.

```ts
truncateByLines(longArticle, {
  font: "16px Inter",
  maxWidth: 320,
  lineHeight: 22,
  maxLines: 3,
})
```

### `measureHeight(text, options)`

Measure rendered height at a given width — no DOM needed.

```ts
measureHeight("Hello\nworld", {
  font: "16px Inter",
  maxWidth: 320,
  lineHeight: 22,
})
// → 44
```

### `createTruncator(config)` ★

Pre-configure `font` (and optional defaults) for repeated use.

```ts
const t = createTruncator({
  font: "16px Inter",
  lineHeight: 22,
  ellipsis: "…",
})

// Font is already set — pass only what varies
t.truncateByWidth("Hello", { maxWidth: 200 })
t.truncateByLines(longArticle, { maxWidth: 320, maxLines: 3 })
t.measureHeight("Hello\nworld", { maxWidth: 320 })

// Per-call overrides win
t.truncateByWidth("Bold text", { font: "bold 24px Inter", maxWidth: 200 })
```

Returns an object with `truncate`, `truncateByWidth`, `truncateByLines`, and `measureHeight` — all with `font` pre-bound.

## Options reference

### `TruncateOptions`

| Option | Type | Default | Required | Used by |
|---|---|---|---|---|
| `font` | `string` | — | ✅ | All |
| `maxWidth` | `number` | — | ✅ | All |
| `lineHeight` | `number` | `20` | only for lines | `truncateByLines` |
| `maxLines` | `number` | — | only for lines | `truncateByLines` |
| `ellipsis` | `string` | `"…"` | ❌ | truncation |
| `wordBreak` | `'normal' \| 'keep-all'` | `'normal'` | ❌ | All |
| `letterSpacing` | `number` | — | ❌ | All |
| `whiteSpace` | `'normal' \| 'pre-wrap'` | `'normal'` | ❌ | All |

### `MeasureOptions`

| Option | Type | Default | Required |
|---|---|---|---|
| `font` | `string` | — | ✅ |
| `maxWidth` | `number` | — | ✅ |
| `lineHeight` | `number` | — | ✅ |
| `wordBreak` | `'normal' \| 'keep-all'` | `'normal'` | ❌ |
| `letterSpacing` | `number` | — | ❌ |
| `whiteSpace` | `'normal' \| 'pre-wrap'` | `'normal'` | ❌ |

### `TruncatorConfig`

| Option | Type | Default | Description |
|---|---|---|---|
| `font` | `string` | — | Font pre-bound to all methods |
| `lineHeight` | `number` | — | Default for `truncateByLines` / `measureHeight` |
| `ellipsis` | `string` | `"…"` | Default ellipsis |
| `wordBreak` | `'normal' \| 'keep-all'` | `'normal'` | Default word-break behaviour |
| `letterSpacing` | `number` | — | Default letter spacing |
| `whiteSpace` | `'normal' \| 'pre-wrap'` | `'normal'` | Default whitespace mode |

## Passthrough options

`wordBreak`, `letterSpacing`, and `whiteSpace` are passed directly to `@chenglou/pretext`. See the [Pretext docs](https://github.com/chenglou/pretext) for details.

- `wordBreak: "keep-all"` — prevents breaks inside CJK/Hangul runs
- `letterSpacing` — matches CSS `letter-spacing` in pixels
- `whiteSpace: "pre-wrap"` — preserves explicit `\n` and tabs

## TypeScript

Fully typed. All options interfaces are exported:

```ts
import type { TruncateOptions, MeasureOptions, TruncatorConfig, Truncator } from "truncate"
```

## Why?

- **No layout reflow** — Pretext uses Canvas2D measurement, never touches the DOM
- **No flickering** — Measure before rendering, skip the layout shift dance
- **Works in Workers** — Pure computation, needs only `OffscreenCanvas`
- **Multi-line** — Not just single-line ellipsis, actual line-aware truncation
- **Options bags** — No positional param soup, just clean objects

## How it works

1. Pretext parses and measures every text segment once via Canvas2D
2. Binary search finds the longest prefix that fits your constraint
3. Returns clean truncated text with ellipsis — no DOM, no reflow, no guesswork

## Credits

This library is built on [`@chenglou/pretext`](https://github.com/chenglou/pretext) by [@chenglou](https://github.com/chenglou) — a brilliant DOM-free text measurement engine. Pretext handles all the hard parts: segmenting, shaping, and line-breaking text across scripts and languages.

## License

MIT &copy; 2026 Antonio Bonet K Antonio Bonet
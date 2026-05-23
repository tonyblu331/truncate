# truncate

**DOM-free** text truncation. Measure & truncate text by pixel width or line count without a browser — powered by [`@chenglou/pretext`](https://github.com/chenglou/pretext).

```bash
npm install @antonio-bonet/truncate
```

## API

```ts
import { truncateByWidth, truncateByLines, measureHeight } from "truncate";
```

### `truncateByWidth(text, font, maxWidth, options?)`

Truncate text to fit within a given pixel width on a single line.

```ts
truncateByWidth("A very long string", "16px Inter", 100);
// => "A very lo…"

truncateByWidth("Short", "16px Inter", 200);
// => "Short"
```

### `truncateByLines(text, font, maxWidth, lineHeight, maxLines, options?)`

Truncate text to fit within N lines.

```ts
truncateByLines(longArticle, "16px Inter", 320, 22, 3);
// => "First line\nSecond line\nThird li…"
```

### `measureHeight(text, font, maxWidth, lineHeight)`

Measure the rendered height of text at a given width — no DOM needed.

```ts
measureHeight("Hello\nworld", "16px Inter", 320, 22);
// => 44
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ellipsis` | `string` | `"…"` | Custom ellipsis string |

## Why?

- **No layout reflow** — Pretext uses Canvas2D measurement, never touches the DOM
- **No flickering** — Measure before rendering, skip the layout shift dance
- **Works in Workers** — Pure computation, needs only `OffscreenCanvas`
- **Multi-line** — Not just single-line ellipsis, actual line-aware truncation

## How it works

1. Pretext parses and measures every text segment once via Canvas2D
2. Binary search finds the longest prefix that fits your constraint
3. Returns clean truncated text with ellipsis — no DOM, no reflow, no guesswork

## Credits

This library is built on [`@chenglou/pretext`](https://github.com/chenglou/pretext) by [@chenglou](https://github.com/chenglou) — a brilliant DOM-free text measurement engine. Pretext handles all the hard parts: segmenting, shaping, and line-breaking text across scripts and languages.

## License

MIT &copy; 2026 Antonio Bonet K Antonio Bonet
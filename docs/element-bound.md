# Element-Bound Truncation

`createTruncator(element)` is the explicit DOM boundary for this package. The core API remains text-first and DOM-free; element binding is for component code that already owns a node or a DOM-compatible adapter.

Use it when you want to bind once, infer defaults from the element, and then call truncation methods without passing `(element)` or `(text)` every time.

```ts
import { createTruncator, type DOMCompatibleElement } from "@tonybonet/truncate";

const title = document.querySelector("[data-truncate]")!;
const t = createTruncator(title);

t.truncate();
t.truncate({ maxLines: 2 });
t.truncateMiddle({ ellipsis: "....." });
```

## Contract

- `truncate(text, options)` stays text-only.
- `createTruncator(element)` returns `BoundTruncator`.
- Styles and width are read once at creation time.
- `textContent` is read per call.
- The result is written back to `element.textContent`.
- Repeated calls do not compound prior write-back; the bound truncator keeps the last external source text unless outside code changes `textContent`.
- If styles change, create a new bound truncator.

## What Counts as DOM-Compatible

Native DOM elements match structurally in browser projects, but the exported declarations do not name `Element`. This keeps core-only TypeScript consumers working without `lib.dom`.

```ts
interface DOMNativeElementLike {
  readonly nodeType: number;
  textContent: string | null;
  readonly clientWidth: number;
  getBoundingClientRect: () => { width?: number };
}
```

Custom adapters use the same idea with a stricter `nodeType` and optional style map:

```ts
type DOMCompatibleAdapter = {
  readonly nodeType: 1;
  textContent: string | null;
  readonly computedStyle?: Record<string, string | undefined>;
} & (
  | { readonly clientWidth: number; getBoundingClientRect?: () => { width?: number } }
  | { readonly clientWidth?: number; getBoundingClientRect: () => { width?: number } }
);
```

The bound API accepts either shape:

```ts
type DOMCompatibleElement = DOMNativeElementLike | DOMCompatibleAdapter;
```

## Custom Adapter Example

Use this when the source is a custom renderer, virtual view object, test double, or non-browser integration.

```ts
const label = {
  nodeType: 1 as const,
  textContent: "A long label that should fit inside the sidebar",
  getBoundingClientRect: () => ({ width: 180 }),
  computedStyle: {
    fontSize: "16px",
    fontFamily: "Inter, sans-serif",
    lineHeight: "normal",
    letterSpacing: "-0.25px",
    wordBreak: "normal",
    whiteSpace: "normal",
  },
};

const t = createTruncator(label);

t.truncate();
// label.textContent now contains the truncated result
```

## Width Requirement

An element must provide width at bind time:

- `clientWidth`, or
- `getBoundingClientRect().width`

If neither exists, `createTruncator(element)` throws before writing back to `textContent`.

```ts
const missingWidth = {
  nodeType: 1 as const,
  textContent: "missing width",
};

// TypeScript rejects this shape. In plain JavaScript, or if forced,
// the runtime still throws before changing textContent.
createTruncator(missingWidth as unknown as DOMCompatibleElement);
```

Per-call `maxWidth` can override the cached width for an operation, but it does not replace the bind-time width requirement. The bound API needs a safe default before it can create the truncator.

## Style Inference

For native DOM elements, the library reads `getComputedStyle(element)` when a browser-like `Element` implementation is available.

For custom adapters, the library only reads the adapter's `computedStyle` object. It does not call browser `getComputedStyle` for plain custom objects.

Supported style inputs:

| Style           | Behavior                                                    |
| --------------- | ----------------------------------------------------------- |
| `fontSize`      | Supports `px`, `pt`, `rem`, `em`, `%`, and numeric strings  |
| `fontFamily`    | Defaults to `sans-serif`                                    |
| `fontStyle`     | Included unless `normal`                                    |
| `fontVariant`   | Included unless `normal`                                    |
| `fontWeight`    | Included unless `normal`                                    |
| `lineHeight`    | Supports `normal`, unitless, `px`, `pt`, `rem`, `em`, `%`   |
| `letterSpacing` | Supports signed `px`; ignores unsupported values            |
| `wordBreak`     | Accepts `normal` and `keep-all`; ignores unsupported values |
| `whiteSpace`    | Accepts `normal` and `pre-wrap`; ignores unsupported values |

Missing styles fall back to safe defaults: `16px`, `sans-serif`, and normal line height.

## No-DOM Type Safety

The public declaration files avoid DOM globals. This is intentional:

```json
{
  "compilerOptions": {
    "lib": ["es2023"]
  }
}
```

Core-only consumers can import `truncate` and the exported types without adding `dom` to `lib`. The repo keeps this contract covered with `tests/type-no-dom.ts`.

## When Not to Use It

Use the plain text APIs instead when:

- You do not want write-back to `textContent`.
- You are truncating data before render.
- You need per-call style reads.
- You do not have a stable width source.

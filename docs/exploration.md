# Exploration: Element-Bound Truncation

## Current State

`createTruncator(config)` takes a `Partial<TruncateOptions>` bag and returns a `Truncator` whose methods still require `(text, opts?)` on every call. The caller must manually specify `font`, `maxWidth`, `lineHeight`, etc. — or use `detectFont()` which only reads from `document.body`.

In component code (React, Vue, Svelte), you already have the element. You know its styles. The library should read them. In non-DOM integrations, callers can provide a small adapter with the same text, width, and optional style surface.

## Architectural Decisions

### AD-1: When to read styles — creation time vs per call

**Decision: creation time.**

Rationale:

- Native `getComputedStyle` triggers style recalculation — it's not free
- The existing `createTruncator` pattern caches defaults at creation
- If styles change, caller recreates the truncator — same contract
- Per-call reading would make every `t.truncate()` a hidden DOM read

For custom adapters, the library reads only the adapter's `computedStyle` object and never falls through to browser `getComputedStyle`.

Tradeoff: stale styles if element changes between creation and call. Acceptable — same as how `createTruncator({ font })` doesn't re-read the font option source.

### AD-2: When to read text — creation time vs per call

**Decision: per call.**

Rationale:

- Text is the thing being truncated — it changes between calls
- The whole point is "truncate whatever is currently in this element"
- Reading `element.textContent` is cheap (no style recalc)
- The bound truncator tracks the last value it wrote, so repeated calls with new options do not compound truncation; external `textContent` changes become the new source

### AD-3: Write-back — always vs opt-in

**Decision: always write back.**

Rationale:

- This is the component-level use case — the truncator owns the element's text
- If you don't want write-back, use the existing `truncate(text, options)` API
- Opt-in adds ceremony for the common case

### AD-4: Type discrimination — how to distinguish overloads

**Decision: `typeof arg === 'object' && arg !== null && 'nodeType' in arg && arg.nodeType === 1 && 'textContent' in arg`**

Rationale:

- `nodeType === 1` is the canonical DOM Element check
- Works across iframes, different DOM implementations
- Doesn't trigger on plain objects (which have no `nodeType`)
- Doesn't trigger on `Partial<TruncateOptions>` (which has no `nodeType`)

### AD-5: Return type — same `Truncator` vs new `BoundTruncator`

**Decision: new `BoundTruncator` interface.**

Rationale:

- `BoundTruncator` methods don't take `text` — they read from the element
- Different call signatures = different types = better DX
- TypeScript autocomplete shows the correct API per context
- No confusing overloads on every method

---

## API Surface

### DOM-compatible types

The exported types are structural and do not reference global DOM names. This keeps core-only TypeScript consumers working with `lib: ["es2023"]`, while real DOM elements still match the native-like shape in browser projects.

```ts
export interface DOMNativeElementLike {
  readonly nodeType: number;
  textContent: string | null;
  readonly clientWidth: number;
  getBoundingClientRect: () => { width?: number };
}

export type DOMCompatibleAdapter = {
  readonly nodeType: 1;
  textContent: string | null;
  readonly computedStyle?: DOMCompatibleStyle;
} & (
  | { readonly clientWidth: number; getBoundingClientRect?: () => { width?: number } }
  | { readonly clientWidth?: number; getBoundingClientRect: () => { width?: number } }
);

export type DOMCompatibleElement = DOMNativeElementLike | DOMCompatibleAdapter;
```

### New interface

```ts
export interface BoundTruncator {
  truncate(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateByWidth(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateByLines(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateMiddle(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateStart(opts?: Partial<TruncateOptions>): TruncateResult;
  truncateAtOffset(opts?: Partial<TruncateOptions & { offset?: number }>): TruncateResult;
  truncateRange(opts?: Partial<TruncateOptions & { start?: number; end?: number }>): TruncateResult;
  truncateAround(
    opts?: Partial<
      TruncateOptions & { target?: string; context?: number; before?: number; after?: number }
    >,
  ): TruncateResult;
  measureHeight(opts?: Partial<MeasureOptions>): number;
}
```

### Overloaded `createTruncator`

```ts
export function createTruncator(config: Partial<TruncateOptions>): Truncator;
export function createTruncator(element: DOMCompatibleElement): BoundTruncator;
export function createTruncator(
  arg: Partial<TruncateOptions> | DOMCompatibleElement,
): Truncator | BoundTruncator {
  if (isElement(arg)) return createBoundTruncator(arg);
  return createConfigTruncator(arg);
}
```

### Internal: `inferFromElement`

```ts
// Summary of src/element.ts behavior.
export function inferFromElement(element: DOMCompatibleElement): TruncateOptions {
  const cs = readStyles(element); // custom computedStyle, native getComputedStyle, or {}
  const fontSize = parseFontSize(cs.fontSize ?? "16px");

  return {
    font: buildFontString(cs, fontSize),
    maxWidth: resolveElementWidth(element),
    lineHeight: resolveLineHeight(cs.lineHeight ?? "normal", fontSize),
    letterSpacing: parseSignedPx(cs.letterSpacing ?? "normal"),
    wordBreak: resolveSupportedWordBreak(cs.wordBreak),
    whiteSpace: resolveSupportedWhiteSpace(cs.whiteSpace),
  };
}
```

---

## Affected Files

| File                    | Change                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| `src/element.ts`        | **New** — `inferFromElement`, `resolveLineHeight`, `isElement`        |
| `src/factory.ts`        | **Modify** — overload `createTruncator`, add `createBoundTruncator`   |
| `src/types.ts`          | **Modify** — add `BoundTruncator` and DOM-compatible structural types |
| `src/index.ts`          | **Modify** — re-export `BoundTruncator`                               |
| `tests/element.test.ts` | **New** — element-bound behavior and typing coverage                  |
| `tests/type-no-dom.ts`  | **New** — no-DOM declaration smoke test                               |
| `tests/helpers.ts`      | **Modify** — add `mockElement` helper                                 |

---

## Flow: Bound Truncation

```
createTruncator(element)
  │
  ├─ inferFromElement(element) → TruncateOptions (cached)
  │   ├─ adapter computedStyle or native getComputedStyle(element)
  │   ├─ normalize supported CSS values and ignore unsupported values
  │   ├─ width source (clientWidth or bounding rect) → maxWidth
  │   └─ element.textContent → (read per call, not cached)
  │
  └─ returns BoundTruncator
       │
       t.truncate({ maxLines: 3 })
         ├─ read source text, ignoring prior write-back unless external text changed
         ├─ merge cached options + per-call overrides
         ├─ run truncateByLines(text, merged)
         ├─ write result.text → element.textContent
         └─ return TruncateResult
```

---

## Risks

| Risk                                        | Likelihood | Mitigation                                    |
| ------------------------------------------- | ---------- | --------------------------------------------- |
| Stale styles between creation and call      | Low        | Document: recreate truncator if styles change |
| `lineHeight: "normal"` browser variance     | Low        | Default to `1.2 * fontSize` (CSS spec)        |
| `clientWidth` 0 for inline/hidden elements  | Medium     | Fall back to `getBoundingClientRect().width`  |
| Breaking existing `createTruncator(config)` | Low        | `nodeType === 1` check is unambiguous         |
| DOM globals in public declarations          | Medium     | Keep exported types structural                |
| Adapter without a width source              | Medium     | Throw before write-back                       |

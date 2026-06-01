# Implementation Plan: Element-Bound Truncation

## Current Shape

- Core stays string-first: `truncate(text, options)` remains the single plain-text entry.
- DOM convenience is explicit: `createTruncator(element)` binds once to any `DOMCompatibleElement`, infers style/width, reads source text per call, writes the result back, and avoids compounding prior write-back.
- `DOMCompatibleElement` is structural. Real DOM elements work in browser projects, and custom adapters work without requiring DOM globals in package declarations.
- There is no element overload on `truncate`. That keeps the DOM boundary in one place instead of making the main function ambiguous.
- Custom markers already flow through `ellipsis`, including `.`, `.....`, and ` READ MORE`.
- Playground now includes a custom marker case for GIF/media filenames, emoji-heavy text, and word-style continuation markers with a UI fade.

## SDD Artifacts

- **Element-bound guide**: `docs/element-bound.md` — public adapter contract, width requirement, style inference, and no-DOM TypeScript notes
- **Exploration**: `docs/exploration.md` — architecture decisions, API design, flow diagrams
- **Proposal**: `docs/proposal.md` — intent, scope, risks, success criteria
- **This file**: implementation checklist

## Summary

Overload `createTruncator(element: DOMCompatibleElement)` → returns `BoundTruncator`. Bind once, call many.

```ts
const t = createTruncator(element);
t.truncate();
t.truncate({ maxLines: 3 });
t.truncateMiddle({ ellipsis: "....." });
```

## Implementation Checklist

### 1. Tests First

- [x] Create `tests/element.test.ts` with element-bound behavior and typing coverage
- [x] Add `mockElement` helper to `tests/helpers.ts`
- [x] Add explicit custom marker tests for `.`, `.....`, and ` READ MORE`
- [x] Add no-DOM declaration smoke test

### 2. Element Module

- [x] Create `src/element.ts`
  - `isElement(arg)` — duck-type check (`nodeType === 1`)
  - `inferFromElement(element)` — reads adapter `computedStyle` or native `getComputedStyle`, requires a width source, normalizes supported CSS values, and builds `TruncateOptions`
  - `resolveLineHeight(raw, fontSize)` — resolves `normal`, numeric, px, rem, em
  - `parsePx` equivalent — parses signed CSS px strings for letter spacing

### 3. Factory Overload

- [x] Modify `src/factory.ts`
  - Add `BoundTruncator` interface import
  - Add `createBoundTruncator(element)` internal function
  - Overload `createTruncator` signature
  - Duck-type first argument to route

### 4. Types and Public Surface

- [x] Modify `src/types.ts` — add `BoundTruncator` interface
- [x] Re-export `BoundTruncator`, `DOMCompatibleElement`, `DOMCompatibleAdapter`, and `DOMCompatibleStyle` through the root entry
- [x] Keep `truncate(text, options)` text-only, with no element overload
- [x] Bound `measureHeight` reads source text, not the prior write-back
- [x] Keep public declarations free of DOM globals for core-only consumers

### 5. Website and Cover

- [x] Add custom truncation playground case
- [x] Add optimized generated cover image at `assets/truncate-cover.jpg`
- [x] Point README and website OG metadata at the new cover

### 6. Verify

- [x] `vp test tests/width.test.ts tests/element.test.ts`
- [x] `vp check`
- [x] `vp test`
- [x] `vp run -w test:types:no-dom`
- [x] Website build after package build
- [x] `npm pack --dry-run --json` confirms the cover JPG is excluded from the package

## Next Steps

1. Preview the playground visually and tune spacing if the custom marker section feels crowded.
2. Keep `docs/element-bound.md`, README, and website API docs in sync when the bound adapter contract changes.

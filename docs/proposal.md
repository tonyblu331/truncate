# Proposal: Element-Bound Truncation

## Intent

In component code (React, Vue, Svelte), the caller already has the element and its styles. Today they must manually extract `font`, `maxWidth`, `lineHeight`, etc. and pass them on every call. This is ceremony that `createTruncator` should absorb — bind to an element once, call methods with zero options.

## Scope

### In Scope

- Overload `createTruncator(element: DOMCompatibleElement)` returning `BoundTruncator`
- New `src/element.ts` module for DOM style inference
- `BoundTruncator` interface — methods read text/styles from element, write back
- Element-bound test coverage for inference, overrides, write-back, edge cases, and no-DOM declarations
- README and docs updates for native elements, custom adapters, width requirements, and no-DOM TypeScript consumers

### Out of Scope

- Modifying `truncate(text, options)` top-level function
- Auto-observation (MutationObserver / ResizeObserver)
- CSS property changes on the element (overflow, display)
- Automatic SSR layout measurement
- Creating layout for adapters that do not provide a width source

## Capabilities

### New Capabilities

- `element-bound-truncation`: `createTruncator(element)` overload, `BoundTruncator` interface, DOM-compatible style inference, required width source, write-back behavior

### Modified Capabilities

- None — existing API surface unchanged

## Approach

1. Create `src/element.ts` with `inferFromElement(element)` — reads adapter `computedStyle` or native `getComputedStyle(element)`, requires a width source, normalizes supported CSS values, and builds `TruncateOptions`
2. Add `BoundTruncator` and DOM-compatible structural types to `src/types.ts` — bound methods are the same behaviors as `Truncator` but without `text` parameter, and exported declarations do not require DOM globals
3. Overload `createTruncator` in `src/factory.ts` — duck-type `arg.nodeType === 1` to route to element-bound path
4. Element-bound methods: read source text without compounding prior write-back → merge cached options + overrides → run existing truncation → write back to `element.textContent`
5. TDD: cover native DOM typing, custom adapters, missing width, CSS normalization, write-back, no compounding, and no-DOM type imports

## Affected Areas

| Area                    | Impact   | Description                                              |
| ----------------------- | -------- | -------------------------------------------------------- |
| `src/element.ts`        | New      | DOM reading, style inference, lineHeight resolution      |
| `src/factory.ts`        | Modified | Overload `createTruncator`, add `createBoundTruncator`   |
| `src/types.ts`          | Modified | Add `BoundTruncator` and DOM-compatible structural types |
| `src/index.ts`          | Modified | Re-export `BoundTruncator`                               |
| `tests/element.test.ts` | New      | Element-bound behavior and typing coverage               |
| `tests/helpers.ts`      | Modified | Add `mockElement` helper                                 |
| `tests/type-no-dom.ts`  | New      | No-DOM declaration smoke test                            |

## Risks

| Risk                                           | Likelihood | Mitigation                                   |
| ---------------------------------------------- | ---------- | -------------------------------------------- |
| Stale styles if element changes after creation | Low        | Document: recreate truncator on style change |
| `lineHeight: "normal"` browser variance        | Low        | Default `1.2 * fontSize` (CSS spec)          |
| `clientWidth` 0 for inline/hidden elements     | Medium     | Fall back to `getBoundingClientRect().width` |
| Breaking existing `createTruncator(config)`    | Low        | `nodeType === 1` is unambiguous              |
| DOM globals leak into core-only consumers      | Medium     | Keep exported element types structural       |

## Rollback Plan

Remove `src/element.ts`, revert changes to `factory.ts`, `types.ts`, `index.ts`. No existing behavior is modified — the overload is purely additive.

## Success Criteria

- [x] `createTruncator(element)` returns `BoundTruncator` with all methods
- [x] Methods read text/styles from a DOM-compatible element, write back truncated text
- [x] Explicit options override inferred values
- [x] Element-bound scenarios pass
- [x] No-DOM declaration smoke test passes
- [x] `vp check && vp test` clean
- [x] Existing tests unchanged and passing

import { resolveOrEarly, type ResolveCtx } from "./context.js";
import { fitsSingleLine, narrowGraphemes } from "./pretext-layout.js";
import {
  anchoredCandidate,
  distributeContextBudget,
  resolveAnchoredRange,
  resultIfFits,
  resultWithRange,
  squeezeOversizedTarget,
} from "./range-window.js";
import { findTargetInGraphemes, toGraphemes } from "./text.js";
import type { TruncateOptions, TruncateResult } from "./types.js";
import { truncateByWidth } from "./width.js";

export function truncateAtOffset(
  text: string,
  options: TruncateOptions & { offset?: number },
): TruncateResult {
  const offset =
    options.offset !== undefined && options.offset < 0
      ? toGraphemes(text).length + options.offset
      : options.offset;
  return truncateRange(text, {
    ...options,
    start: offset,
    end: offset,
  });
}

export function truncateAround(
  text: string,
  options: TruncateOptions & { target?: string; context?: number; before?: number; after?: number },
): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  if (!options.target) return truncateByWidth(text, options);
  const graphemes = toGraphemes(text);
  const needle = toGraphemes(options.target);
  const targetIdx = findTargetInGraphemes(graphemes, needle);
  if (targetIdx === -1) return truncateByWidth(text, options);
  return truncateRange(text, {
    ...options,
    start: targetIdx,
    end: targetIdx + needle.length,
  });
}

function truncateAnchoredRange(
  text: string,
  ctx: ResolveCtx,
  options: TruncateOptions & { start: number; end: number },
): TruncateResult {
  const graphemes = toGraphemes(text);
  const range = resolveAnchoredRange(graphemes.length, options);
  const fullAnchor = anchoredCandidate(
    graphemes,
    range.start,
    range.end,
    range.beforeLimit,
    range.afterLimit,
    ctx.ellipsis,
  );
  const fittingFullAnchor = resultIfFits(text, fullAnchor, ctx);
  if (fittingFullAnchor) return fittingFullAnchor;

  const requiredCandidate = anchoredCandidate(
    graphemes,
    range.start,
    range.end,
    0,
    0,
    ctx.ellipsis,
  );
  if (
    range.required > 0 &&
    !fitsSingleLine(requiredCandidate, ctx.font, ctx.maxWidth, ctx.extras)
  ) {
    return squeezeOversizedTarget(text, ctx, graphemes.slice(range.start, range.end));
  }

  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      const budget = Math.max(0, total - range.required);
      const { before, after } = distributeContextBudget(
        budget,
        range.beforeLimit,
        range.afterLimit,
      );
      return anchoredCandidate(gs, range.start, range.end, before, after, ctx.ellipsis);
    },
    requiredCandidate,
  );
  return resultWithRange(text, narrow, ctx, range.required > 0);
}

export function truncateRange(
  text: string,
  options: TruncateOptions & { start?: number; end?: number },
): TruncateResult {
  if (options.start === undefined && options.end === undefined)
    return truncateByWidth(text, options);
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  return truncateAnchoredRange(text, r.ctx, {
    ...options,
    start: options.start ?? options.end ?? 0,
    end: options.end ?? options.start ?? 0,
  });
}

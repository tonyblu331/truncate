import { result, type ResolveCtx } from "./context.js";
import { fitsSingleLine, narrowGraphemes } from "./pretext-layout.js";
import { clampInt } from "./text.js";
import type { TruncateOptions, TruncateResult } from "./types.js";

export type AnchoredRange = {
  start: number;
  end: number;
  required: number;
  beforeLimit: number;
  afterLimit: number;
};

export function anchoredCandidate(
  gs: string[],
  start: number,
  end: number,
  before: number,
  after: number,
  ellipsis: string,
): string {
  const front = start - before > 0;
  const back = end + after < gs.length;
  let c = "";
  if (front) c += ellipsis;
  c += gs.slice(start - before, end + after).join("");
  if (back) c += ellipsis;
  return c;
}

export function resolveAnchoredRange(
  length: number,
  options: TruncateOptions & { start: number; end: number },
): AnchoredRange {
  const start = clampInt(options.start, 0, length, 0);
  const end = clampInt(options.end, 0, length, start);
  const rangeStart = Math.min(start, end);
  const rangeEnd = Math.max(start, end);
  return {
    start: rangeStart,
    end: rangeEnd,
    required: Math.max(0, rangeEnd - rangeStart),
    beforeLimit: resolveContextLimit(options.before, options.context, rangeStart),
    afterLimit: resolveContextLimit(options.after, options.context, length - rangeEnd),
  };
}

function resolveContextLimit(
  sideLimit: number | undefined,
  sharedLimit: number | undefined,
  max: number,
): number {
  if (sideLimit !== undefined) return clampInt(sideLimit, 0, max, max);
  if (sharedLimit !== undefined) return clampInt(sharedLimit, 0, max, max);
  return max;
}

export function squeezeOversizedTarget(
  text: string,
  ctx: ResolveCtx,
  target: string[],
): TruncateResult {
  const visibleTarget = narrowGraphemes(
    target,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      const prefixLen = Math.ceil(total / 2);
      const suffixLen = Math.floor(total / 2);
      return (
        ctx.ellipsis +
        gs.slice(0, prefixLen).join("") +
        ctx.ellipsis +
        gs.slice(gs.length - suffixLen).join("") +
        ctx.ellipsis
      );
    },
    ctx.ellipsis,
  );
  return {
    text: visibleTarget,
    original: text,
    truncated: true,
    metrics: { originalLineCount: ctx.originalLineCount, rangePreserved: false },
  };
}

export function distributeContextBudget(
  budget: number,
  beforeLimit: number,
  afterLimit: number,
): { before: number; after: number } {
  const preferredBefore = Math.min(beforeLimit, Math.ceil(budget / 2));
  let before = preferredBefore;
  let after = Math.min(afterLimit, budget - before);
  if (before + after < budget) {
    const beforeRoom = beforeLimit - before;
    const afterRoom = afterLimit - after;
    const remaining = budget - before - after;
    if (afterRoom > 0) after += Math.min(afterRoom, remaining);
    if (before + after < budget && beforeRoom > 0) {
      before += Math.min(beforeRoom, budget - before - after);
    }
  }
  return { before, after };
}

export function resultIfFits(
  text: string,
  candidate: string,
  ctx: ResolveCtx,
): TruncateResult | null {
  return fitsSingleLine(candidate, ctx.font, ctx.maxWidth, ctx.extras)
    ? result(text, candidate, ctx, candidate !== text)
    : null;
}

export function resultWithRange(
  text: string,
  visible: string,
  ctx: ResolveCtx,
  rangePreserved: boolean,
): TruncateResult {
  return {
    text: visible,
    original: text,
    truncated: true,
    metrics: { originalLineCount: ctx.originalLineCount, rangePreserved },
  };
}

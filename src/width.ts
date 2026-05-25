import { layoutNextLineRange, materializeLineRange } from "@chenglou/pretext";
import { resolveOrEarly, result } from "./context.js";
import { fitsSingleLine, narrowGraphemes, prepSeg } from "./pretext-layout.js";
import { toGraphemes } from "./text.js";
import type { TruncateOptions, TruncateResult } from "./types.js";

export function truncateByWidth(text: string, options: TruncateOptions): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const pSeg = prepSeg(text, ctx.font, ctx.extras);
  const firstRange = layoutNextLineRange(pSeg, { segmentIndex: 0, graphemeIndex: 0 }, ctx.maxWidth);
  if (!firstRange) return result(text, "", ctx, true);
  const firstLine = materializeLineRange(pSeg, firstRange).text;
  const candidate = firstLine + ctx.ellipsis;
  if (fitsSingleLine(candidate, ctx.font, ctx.maxWidth, ctx.extras))
    return result(text, candidate, ctx, true);
  const graphemes = toGraphemes(firstLine);
  return result(
    text,
    narrowGraphemes(
      graphemes,
      ctx.font,
      ctx.maxWidth,
      ctx.extras,
      (gs, t) => gs.slice(0, t).join("") + ctx.ellipsis,
      ctx.ellipsis,
    ),
    ctx,
    true,
  );
}

export function truncateMiddle(text: string, options: TruncateOptions): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => {
      const prefixLen = Math.ceil(total / 2);
      const suffixLen = Math.floor(total / 2);
      return gs.slice(0, prefixLen).join("") + ctx.ellipsis + gs.slice(n - suffixLen).join("");
    },
    ctx.ellipsis,
  );
  return result(text, narrow, ctx, true);
}

export function truncateStart(text: string, options: TruncateOptions): TruncateResult {
  const r = resolveOrEarly(text, options);
  if ("early" in r) return r.early;
  const { ctx } = r;
  const graphemes = toGraphemes(text);
  const n = graphemes.length;
  const narrow = narrowGraphemes(
    graphemes,
    ctx.font,
    ctx.maxWidth,
    ctx.extras,
    (gs, total) => ctx.ellipsis + gs.slice(n - total).join(""),
    ctx.ellipsis,
  );
  return result(text, narrow, ctx, true);
}

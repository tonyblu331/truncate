import { layout, materializeLineRange, walkLineRanges } from "@chenglou/pretext";
import { resolveBase } from "./context.js";
import { fitsSingleLine, narrowGraphemes, prep, prepSeg } from "./pretext-layout.js";
import { clampInt, toGraphemes } from "./text.js";
import type { MeasureOptions, TruncateOptions, TruncateResult } from "./types.js";

export function truncateByLines(text: string, options: TruncateOptions): TruncateResult {
  if (!text) return { text: "", original: "", truncated: false, metrics: { originalLineCount: 0 } };
  const { font, maxWidth, extras } = resolveBase(options);
  const ellipsis = options.ellipsis ?? "\u2026";
  if (maxWidth <= 0)
    return { text: "", original: text, truncated: true, metrics: { originalLineCount: 0 } };

  if (options.keepLines) {
    const indices = [...new Set(options.keepLines.filter((n) => Number.isInteger(n) && n > 0))];
    const allLines = text.replace(/\r\n/g, "\n").split("\n");
    const originalLineCount = allLines.length;
    const selected = allLines.filter((_, i) => indices.includes(i + 1));
    if (selected.length === 0)
      return { text: "", original: text, truncated: true, metrics: { originalLineCount } };
    const truncated = selected.map((line) => {
      if (!line || fitsSingleLine(line, font, maxWidth, extras)) return line;
      const c = line + ellipsis;
      if (fitsSingleLine(c, font, maxWidth, extras)) return c;
      const gs = toGraphemes(line);
      return narrowGraphemes(
        gs,
        font,
        maxWidth,
        extras,
        (gs, t) => gs.slice(0, t).join("") + ellipsis,
        ellipsis,
      );
    });
    const anyTruncated = truncated.some((t, i) => t !== selected[i]);
    return {
      text: truncated.join("\n"),
      original: text,
      truncated: anyTruncated || selected.length !== allLines.length,
      metrics: { originalLineCount },
    };
  }

  const maxLines = clampInt(options.maxLines, 0, Number.MAX_SAFE_INTEGER, 1);
  if (maxLines <= 0)
    return { text: "", original: text, truncated: true, metrics: { originalLineCount: 0 } };
  const prepared = prepSeg(text, font, extras);
  const visibleRanges: Parameters<typeof materializeLineRange>[1][] = [];
  const originalLineCount = walkLineRanges(prepared, maxWidth, (line) => {
    if (visibleRanges.length < maxLines) visibleRanges.push(line);
  });
  const visibleLines = visibleRanges.map((line) => materializeLineRange(prepared, line));
  if (originalLineCount <= maxLines) {
    const narrowed = visibleLines.map((line) =>
      line.width <= maxWidth
        ? line.text
        : narrowGraphemes(
            toGraphemes(line.text),
            font,
            maxWidth,
            extras,
            (gs, t) => gs.slice(0, t).join("") + ellipsis,
            ellipsis,
          ),
    );
    const narrowedText = narrowed.join("\n");
    return {
      text: narrowedText,
      original: text,
      truncated: narrowedText !== text,
      metrics: { originalLineCount },
    };
  }
  const leading = visibleLines.slice(0, maxLines - 1);
  const prefix = leading.map((l) => l.text).join("\n");
  const lastSource = visibleLines[maxLines - 1].text;
  const metrics = { originalLineCount };
  if (fitsSingleLine(lastSource + ellipsis, font, maxWidth, extras)) {
    const result =
      leading.length > 0 ? prefix + "\n" + lastSource + ellipsis : lastSource + ellipsis;
    return { text: result, original: text, truncated: true, metrics };
  }
  const gs = toGraphemes(lastSource);
  const narrow = narrowGraphemes(
    gs,
    font,
    maxWidth,
    extras,
    (gs, t) => gs.slice(0, t).join("") + ellipsis,
    ellipsis,
  );
  return {
    text: leading.length > 0 ? prefix + "\n" + narrow : narrow,
    original: text,
    truncated: true,
    metrics,
  };
}

export function measureHeight(text: string, options: MeasureOptions): number {
  if (!text) return 0;
  const { font, maxWidth, extras } = resolveBase(options);
  if (maxWidth <= 0) return 0;
  const lh = options.lineHeight ?? 20;
  const p = prep(text, font, extras);
  const { height } = layout(p, maxWidth, lh);
  return Math.max(height, lh);
}

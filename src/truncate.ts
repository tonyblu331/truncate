import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

export interface TruncateOptions {
  ellipsis?: string
}

function prepareAndCheck(text: string, font: string, maxWidth: number): number {
  const p = prepare(text, font)
  return layout(p, maxWidth, 1).lineCount
}

function binaryTruncate(text: string, font: string, maxWidth: number, ellipsis: string): string {
  let lo = 0
  let hi = text.length

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const candidate = text.slice(0, mid) + ellipsis

    if (prepareAndCheck(candidate, font, maxWidth) <= 1) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }

  return text.slice(0, lo) + ellipsis
}

export function truncateByWidth(
  text: string,
  font: string,
  maxWidth: number,
  options?: TruncateOptions,
): string {
  const ellipsis = options?.ellipsis ?? '\u2026'
  if (!text) return ''

  if (prepareAndCheck(text, font, maxWidth) <= 1) return text

  const pSeg = prepareWithSegments(text, font)
  const { lines } = layoutWithLines(pSeg, maxWidth, 1)
  const firstLine = lines[0].text

  if (prepareAndCheck(firstLine + ellipsis, font, maxWidth) <= 1) {
    return firstLine + ellipsis
  }

  return binaryTruncate(firstLine, font, maxWidth, ellipsis)
}

export function truncateByLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  options?: TruncateOptions,
): string {
  const ellipsis = options?.ellipsis ?? '\u2026'
  if (!text) return ''
  if (maxLines <= 0) return ''

  const prepared = prepareWithSegments(text, font)
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight)

  if (lines.length <= maxLines) return text

  const leading = lines.slice(0, maxLines - 1)
  const prefix = leading.map(l => l.text).join('\n')
  const lastSource = lines[maxLines - 1].text

  if (prepareAndCheck(lastSource + ellipsis, font, maxWidth) <= 1) {
    return leading.length > 0 ? prefix + '\n' + lastSource + ellipsis : lastSource + ellipsis
  }

  const truncated = binaryTruncate(lastSource, font, maxWidth, ellipsis)
  return leading.length > 0 ? prefix + '\n' + truncated : truncated
}

export function measureHeight(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
): number {
  if (!text) return 0
  const prepared = prepare(text, font)
  const { height } = layout(prepared, maxWidth, lineHeight)
  return Math.max(height, lineHeight)
}
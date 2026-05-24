import { useState } from 'react'

let cached: string | null = null

const BASE_PX = 18

function detect(): string {
  if (cached) return cached
  const family = getComputedStyle(document.body).fontFamily
  const commaIdx = family.indexOf(',')
  const first = commaIdx > -1 ? family.slice(0, commaIdx).trim() : family.trim()
  const quoted = first.startsWith("'") || first.startsWith('"') ? first : `'${first}'`
  cached = `${BASE_PX}px ${quoted}`
  return cached!
}

export function useDetectFont(): string {
  const [font] = useState(detect)
  return font
}

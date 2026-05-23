import { useState, type ReactNode } from 'react'

interface Props {
  text: string
  children: ReactNode
  className?: string
}

export function CopyButton({ text, children, className }: Props) {
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button onClick={handle} className={className}>
      {copied ? 'copied!' : children}
    </button>
  )
}

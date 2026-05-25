import { useCallback, useEffect, useState } from "react";

const THRESHOLD = 1.4;

function CopyCmd({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [cmd]);

  return (
    <button
      onClick={copy}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-s text-surface transition-[transform,background] duration-150 ease-out active:scale-[.97] hover:bg-white/10 bg-white/5"
      type="button"
    >
      <span className="select-none text-dim">$</span>
      <span className="flex-1 truncate text-left">{cmd}</span>
      <span className="text-[10px] shrink-0 text-dim">{copied ? "copied" : "copy"}</span>
    </button>
  );
}

export function FloatingActions() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{
        transformOrigin: "bottom right",
        clipPath: visible ? "circle(150% at bottom right)" : "circle(0% at bottom right)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition:
          "clip-path 350ms cubic-bezier(0.23, 1, 0.32, 1), opacity 250ms ease-out, transform 350ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div className="w-56 overflow-hidden rounded-xl bg-base text-surface ring-1 ring-white/[0.08]">
        <button
          onClick={scrollToTop}
          className="flex w-full items-center gap-2.5 px-4 py-3 font-sans text-m transition-[transform,background] duration-150 ease-out hover:bg-white/5 active:scale-[.97]"
          type="button"
        >
          <span className="text-dim" aria-hidden>
            ↑
          </span>
          Back to top
        </button>

        <div className="h-px bg-white/[0.08]" />

        <div className="space-y-1.5 p-3 pb-2">
          <p className="px-1 pb-0.5 font-sans text-[11px] uppercase tracking-wider text-dim">
            Install
          </p>
          <CopyCmd cmd="pnpm add truncate" />
          <CopyCmd cmd="npm install truncate" />
        </div>

        <div className="h-px bg-white/[0.08]" />

        <a
          href="/docs"
          className="flex w-full items-center gap-2.5 px-4 py-3 font-sans text-m transition-[transform,background] duration-150 ease-out hover:bg-white/5 active:scale-[.97]"
        >
          <span className="text-dim" aria-hidden>
            →
          </span>
          Documentation
        </a>
      </div>
    </div>
  );
}

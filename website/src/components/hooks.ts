import { useEffect, useState } from "react";

export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fallback = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 800);
    const fontReady = document.fonts?.ready ?? Promise.resolve(document.fonts);
    void fontReady.then(
      () => {
        window.clearTimeout(fallback);
        if (!cancelled) setReady(true);
      },
      () => {
        window.clearTimeout(fallback);
        if (!cancelled) setReady(true);
      },
    );
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  return ready;
}

export function useScrollPastViewport(threshold: number): boolean {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return mounted && visible;
}

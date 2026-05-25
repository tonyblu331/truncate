import CompressionInstrument from "./CompressionInstrument";
import { BTN_CLS, T } from "./ui.tsx";
import { INSTALL } from "./playgroundData";

const CAPABILITIES = ["width", "lines", "target", "range", "css units", "graphemes"];

export default function PlaygroundHeader({
  bundleSize,
  bundleGzip,
}: {
  bundleSize?: string;
  bundleGzip?: string;
}) {
  return (
    <header className="pt-20 pb-10 mb-16 ring-0 ring-b-base/15 ring-b-1">
      <T role="dim" size="s" mono className="block mb-3 uppercase tracking-wider">
        DOM-free text fitting engine
      </T>
      <T as="h1" size="l" className="mb-2 leading-heading text-balance">
        Truncate
      </T>
      <T role="secondary" size="m" as="p" className="leading-body mb-5 max-w-80">
        Keep the important text visible. Fit copy by width, lines, target strings, explicit ranges,
        and CSS-like units without layout reads.
      </T>
      <div className="flex flex-wrap gap-2 mb-6">
        {CAPABILITIES.map((capability) => (
          <span
            key={capability}
            className="font-mono text-s uppercase tracking-wider px-2 py-1 ring-1 ring-base/15 text-base/65"
          >
            {capability}
          </span>
        ))}
      </div>

      <CompressionInstrument />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {INSTALL.map(({ label, cmd }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigator.clipboard.writeText(cmd)}
            className={BTN_CLS}
          >
            <T role="dim" as="span" size="s" mono>
              $
            </T>{" "}
            {cmd}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <T role="dim" size="s" mono>
          {bundleSize} {bundleGzip ? `(${bundleGzip} gzip)` : ""}
        </T>
        <T role="dim" size="s" mono className="text-base/15">
          /
        </T>
        <a
          href="https://github.com/tonyblu331/truncate?tab=readme-ov-file#api"
          target="_blank"
          rel="noreferrer"
        >
          <T
            role="secondary"
            size="s"
            mono
            as="span"
            className="underline underline-offset-2 hover:text-base"
          >
            Docs
          </T>
        </a>
        <T role="dim" size="s" mono className="text-base/15">
          /
        </T>
        <a href="https://github.com/tonyblu331/truncate" target="_blank" rel="noreferrer">
          <T
            role="secondary"
            size="s"
            mono
            as="span"
            className="underline underline-offset-2 hover:text-base"
          >
            GitHub
          </T>
        </a>
      </div>
    </header>
  );
}

import { useState, type ReactNode } from "react";

export type Role = "primary" | "secondary" | "dim";
export type Sz = "s" | "m" | "l";

const roleCls: Record<Role, string> = {
  primary: "text-base",
  secondary: "text-base",
  dim: "text-base",
};
const szCls: Record<Sz, string> = { s: "text-s", m: "text-m", l: "text-l" };

export function T({
  role = "primary",
  size = "m",
  mono = false,
  as: Tag = "span",
  className = "",
  style,
  children,
}: {
  role?: Role;
  size?: Sz;
  mono?: boolean;
  as?: "p" | "span" | "div" | "label" | "h1" | "h2" | "h3";
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <Tag
      style={style}
      className={`${szCls[size]} ${roleCls[role]} ${mono ? "font-mono" : "font-sans"} ${className}`}
    >
      {children}
    </Tag>
  );
}

export const RANGE_CLS =
  "w-40 h-px appearance-none bg-base/35 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base [&::-webkit-slider-thumb]:cursor-pointer";

export const BTN_CLS =
  "font-mono text-s px-3 py-1.5 ring-1 ring-base/15 text-base no-underline cursor-pointer hover:bg-base hover:text-surface transition-colors";

export function CopyButton({
  content,
  label = "copy",
  copiedLabel = "copied",
  className = "",
}: {
  content: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`${BTN_CLS} ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs px-1.5 py-0.5 ring-1 ring-base/15 text-base/65 uppercase tracking-wider">
      {children}
    </span>
  );
}

export function PreBlock({ children, className = "" }: { children: string; className?: string }) {
  return (
    <pre
      className={`font-mono text-s leading-relaxed ring-1 ring-base/15 p-4 overflow-x-auto ${className}`}
    >
      <code>{children}</code>
    </pre>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  suffix = "",
  units,
  unit,
  onUnitChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
  units?: string[];
  unit?: string;
  onUnitChange?: (u: string) => void;
}) {
  const id = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const cycle = () => {
    if (!units || !unit || !onUnitChange) return;
    const i = units.indexOf(unit);
    onUnitChange(units[(i + 1) % units.length]);
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-s text-base uppercase">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className={RANGE_CLS}
          aria-label={label}
        />
        <span className="font-mono text-s text-base whitespace-nowrap">
          {value}
          {units && unit ? (
            <button
              type="button"
              onClick={cycle}
              className="cursor-pointer underline underline-offset-2 text-base/45 hover:text-base ml-0.5"
            >
              {unit}
            </button>
          ) : (
            suffix
          )}
        </span>
      </div>
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  rows = 2,
  label = "Sample text",
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  label?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full text-m leading-body p-3 ring-1 ring-base/15 resize-y min-h-[8em] focus:outline-none focus:ring-2 text-base bg-surface"
      aria-label={label}
    />
  );
}

export function Section({
  id,
  title,
  desc,
  actions,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-24">
      <div className="flex items-start justify-between gap-4">
        <T
          as="h2"
          size="l"
          className="mb-1 ring-0 ring-b-base/15 ring-b-1 pb-1 leading-heading text-balance"
        >
          {title}
        </T>
      </div>
      <T role="secondary" size="m" as="p" className="leading-body mb-6 break-words">
        {desc}
      </T>
      {actions && <div className="flex flex-wrap items-start gap-x-6 gap-y-3 mb-4">{actions}</div>}
      {children}
    </section>
  );
}

export function Result({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 mt-4 ring-1 ring-base/15 min-h-12">
      <T as="div" size="m" className="leading-body break-words">
        {children}
      </T>
    </div>
  );
}

export function Code({ code }: { code: string }) {
  return (
    <div className="relative mt-4">
      <CopyButton content={code} className="absolute -top-px right-0 z-10 px-2 py-0.5" />
      <pre className="font-mono text-s leading-relaxed ring-1 ring-base/15 p-4 pt-10 overflow-x-auto max-w-full">
        <code>
          <span key={code} className="code-content block min-w-max">
            {code}
          </span>
        </code>
      </pre>
    </div>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-4 mb-24 select-none" aria-hidden>
      <div className="flex-1 border-t border-base/15" />
      <T size="m" className="text-base/85 tracking-[0.2em] select-none">
        ...
      </T>
      <div className="flex-1 border-t border-base/15" />
    </div>
  );
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center font-mono text-s text-base cursor-pointer capitalize"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="appearance-none w-3 h-3 rounded-full ring-1 ring-base mr-1.5 cursor-pointer checked:bg-base"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function ToggleGroup({
  value,
  onChange,
  options,
}: {
  value: Set<string>;
  onChange: (v: string) => void;
  options: { value: string; label?: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center font-mono text-s text-base cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value.has(opt.value)}
            onChange={() => onChange(opt.value)}
            className="appearance-none w-3 h-3 ring-1 ring-base mr-1.5 cursor-pointer checked:bg-base"
          />
          {opt.label ?? opt.value}
        </label>
      ))}
    </div>
  );
}

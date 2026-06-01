import { Slider } from "./ui.tsx";
import { UNITS } from "./playgroundData";

const DEFAULT_FONT_PX = 18;

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getRootFontSize(): number {
  if (typeof document === "undefined") return DEFAULT_FONT_PX;
  return readNumber(getComputedStyle(document.documentElement).fontSize, DEFAULT_FONT_PX);
}

function getBodyFontSize(): number {
  if (typeof document === "undefined" || !document.body) return DEFAULT_FONT_PX;
  return readNumber(getComputedStyle(document.body).fontSize, getRootFontSize());
}

function getZeroGlyphWidth(): number {
  if (typeof document === "undefined") return getBodyFontSize() * 0.55;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return getBodyFontSize() * 0.55;
  context.font = getComputedStyle(document.body).font;
  return context.measureText("0").width || getBodyFontSize() * 0.55;
}

function getUnitScale(unit: string): number {
  if (unit === "px") return 1;
  if (unit === "rem") return getRootFontSize();
  if (unit === "em") return getBodyFontSize();
  if (unit === "ch") return getZeroGlyphWidth();
  if (typeof window === "undefined") return 1;
  if (unit === "vw") return window.innerWidth / 100;
  if (unit === "vh") return window.innerHeight / 100;
  if (unit === "vmin") return Math.min(window.innerWidth, window.innerHeight) / 100;
  if (unit === "vmax") return Math.max(window.innerWidth, window.innerHeight) / 100;
  return 1;
}

function roundWidth(value: number, unit: string): number {
  const precision = unit === "px" ? 0 : 2;
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function toPx(value: number, unit: string): number {
  return value * getUnitScale(unit);
}

function fromPx(px: number, unit: string): number {
  return roundWidth(px / getUnitScale(unit), unit);
}

function getStep(unit: string): number {
  return unit === "px" ? 1 : 0.01;
}

export default function WidthControl({
  value,
  unit,
  onChange,
  onUnitChange,
  min = 50,
  max = 600,
}: {
  value: number;
  unit: string;
  onChange: (value: number) => void;
  onUnitChange: (unit: string) => void;
  min?: number;
  max?: number;
}) {
  const displayMin = fromPx(min, unit);
  const displayMax = fromPx(max, unit);
  const handleUnitChange = (nextUnit: string) => {
    const px = toPx(value, unit);
    onChange(fromPx(px, nextUnit));
    onUnitChange(nextUnit);
  };

  return (
    <Slider
      label="Max width"
      value={value}
      onChange={onChange}
      min={displayMin}
      max={displayMax}
      step={getStep(unit)}
      units={UNITS}
      unit={unit}
      onUnitChange={handleUnitChange}
    />
  );
}

import { Slider } from "./ui.tsx";
import { UNITS } from "./playgroundData";

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
  return (
    <Slider
      label="Max width"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      units={UNITS}
      unit={unit}
      onUnitChange={onUnitChange}
    />
  );
}

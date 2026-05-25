export type PlaygroundTab = "demos" | "api";

function tabClass(active: boolean): string {
  return `cursor-pointer uppercase tracking-wider pb-1 mb-[-1px] border-b-2 ${
    active ? "text-base border-base" : "text-base/45 hover:text-base border-transparent"
  }`;
}

export default function PlaygroundTabs({
  value,
  onChange,
}: {
  value: PlaygroundTab;
  onChange: (tab: PlaygroundTab) => void;
}) {
  return (
    <div className="flex gap-6 mb-16 font-mono text-s border-b border-base/15" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={value === "demos"}
        onClick={() => onChange("demos")}
        className={tabClass(value === "demos")}
      >
        Demos
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "api"}
        onClick={() => onChange("api")}
        className={tabClass(value === "api")}
      >
        API Docs
      </button>
    </div>
  );
}

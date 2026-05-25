import { useState } from "react";
import ApiDocs from "./ApiDocs";
import PlaygroundDemos from "./PlaygroundDemos";
import PlaygroundHeader from "./PlaygroundHeader";
import PlaygroundTabs, { type PlaygroundTab } from "./PlaygroundTabs";
import { useFontsReady } from "./hooks";

export default function Playground({
  bundleSize,
  bundleGzip,
}: {
  bundleSize?: string;
  bundleGzip?: string;
}) {
  const fontsReady = useFontsReady();
  const [tab, setTab] = useState<PlaygroundTab>("demos");

  if (!fontsReady) return null;

  return (
    <div>
      <PlaygroundHeader bundleSize={bundleSize} bundleGzip={bundleGzip} />
      <PlaygroundTabs value={tab} onChange={setTab} />
      <div key={tab} className="tab-panel">
        {tab === "demos" ? <PlaygroundDemos /> : <ApiDocs />}
      </div>
    </div>
  );
}

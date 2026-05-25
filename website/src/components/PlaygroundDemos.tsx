import CjkDemo from "./CjkDemo";
import FactoryDemo from "./FactoryDemo";
import LanguageDemo from "./LanguageDemo";
import LetterSpacingDemo from "./LetterSpacingDemo";
import LinesSection from "./LinesSection.tsx";
import TargetRangeDemo from "./TargetRangeDemo";
import WidthDemo from "./WidthDemo";
import { Divider } from "./ui.tsx";

export default function PlaygroundDemos() {
  return (
    <>
      <WidthDemo />
      <Divider />
      <TargetRangeDemo />
      <Divider />
      <LinesSection />
      <Divider />
      <LanguageDemo />
      <Divider />
      <CjkDemo />
      <Divider />
      <LetterSpacingDemo />
      <Divider />
      <FactoryDemo />
    </>
  );
}

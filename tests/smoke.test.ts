import { expect, test } from "vite-plus/test";
import { packageApi, FONT } from "./helpers.ts";
test("package export surface: exposes truncateRange from published entry", () => {
  expect(typeof packageApi.truncateRange).toBe("function");
  const r = packageApi.truncateRange("alpha beta gamma delta", {
    font: FONT,
    maxWidth: 140,
    start: 11,
    end: 16,
  });
  expect(r.text).toContain("gamma");
  expect(r.metrics.rangePreserved).toBe(true);
});

import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/index.ts", "src/width.ts", "src/lines.ts", "src/range.ts", "src/factory.ts"],
    dts: true,
    exports: false,
    format: ["esm"],
    sourcemap: false,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
  test: {
    setupFiles: ["./tests/setup.ts"],
  },
});

import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    dts: true,
    exports: true,
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

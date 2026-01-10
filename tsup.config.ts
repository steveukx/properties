import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  bundle: true,
  skipNodeModulesBundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  target: "es2022",
  outDir: "dist",
});

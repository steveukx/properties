import { defineConfig } from 'tsup';

const shared = {
   entry: ['src/index.ts'],
   bundle: true,
   skipNodeModulesBundle: true,
   splitting: false,
   sourcemap: true,
   target: 'es2022',
};

export default defineConfig([
   {
      ...shared,
      format: ['cjs'],
      outDir: 'dist/cjs',
      clean: true,
      outExtension: () => ({ js: '.cjs' }),
   },
   {
      ...shared,
      format: ['esm'],
      outDir: 'dist/esm',
      clean: false,
      outExtension: () => ({ js: '.mjs' }),
   },
   {
      entry: ['src/index.ts'],
      format: ['esm', 'cjs'],
      outDir: 'dist/types',
      dts: { only: true },
      clean: false,
   },
]);

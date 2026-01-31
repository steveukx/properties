import { realpathSync } from 'node:fs';
import { join } from 'node:path';

import { mkdir, mkdtemp, writeFile } from './io';

export interface TestContext {
   path: (...segments: string[]) => string;
   dir: (...paths: string[]) => Promise<string>;
   file: (path: string | string[], content?: string) => Promise<string>;
   files: (...paths: (string | string[])[]) => Promise<void>;
   readonly root: string;
   readonly rootResolvedPath: string;
}

export async function createTestContext(): Promise<TestContext> {
   const root = await mkdtemp();

   const context: TestContext = {
      path(...segments: string[]) {
         return join(root, ...segments);
      },
      async dir(...paths: string[]) {
         if (!paths.length) {
            return root;
         }

         return mkdir(context.path(...paths));
      },
      async file(path: string | string[], content = `File content ${path}`) {
         if (Array.isArray(path)) {
            await context.dir(path[0]);
         }

         const pathArray = Array.isArray(path) ? path : [path];
         return writeFile(context.path(...pathArray), content);
      },
      async files(...paths: (string | string[])[]) {
         for (const path of paths) {
            await context.file(path as string | string[]);
         }
      },
      get root() {
         return root;
      },
      get rootResolvedPath() {
         return realpathSync(root);
      },
   };

   return context;
}

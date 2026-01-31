import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { logger } from './logger.mjs';

const log = logger('package.json');
const src = fileURLToPath(new URL('../package.json', import.meta.url));

(async () => {
   log('Reading');
   const current = await read(src);
   log('Mutating');
   const pkg = mutate(current);
   log('Saving');
   await save(pkg);
   log('Done');
})();

function save(content) {
   return writeFile(src, JSON.stringify(content, null, 2), 'utf8');
}

function read() {
   return readFile(src, 'utf8').then((content) => JSON.parse(String(content)));
}

function mutate(json) {
   const { publish, scripts, packageManager, devDependencies, ...pkg } = json;

   return {
      ...pkg,
      ...publish,
   };
}

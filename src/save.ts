import { type FileHandle, open } from 'node:fs/promises';

import { PropertiesIterator } from './properties-reader.types';

export async function save(destFile: string, props: PropertiesIterator) {
   let pointer: null | FileHandle = null;
   try {
      pointer = await open(destFile, 'w');
      for (const line of props) {
         await pointer.writeFile(`${line}\n`, 'utf8');
      }
   } finally {
      await pointer?.close();
   }
}

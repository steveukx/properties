import { readFileSync } from 'node:fs';

import { type ReadLineTask, read } from './read';

function newTask(): ReadLineTask {
   return { section: '', properties: new Map() };
}

export function append(
   sourceFile: string | undefined | null,
   encoding: BufferEncoding,
   task = newTask()
) {
   if (!sourceFile) {
      return task;
   }

   const file = readFileSync(sourceFile, encoding);
   return read(file, task);
}

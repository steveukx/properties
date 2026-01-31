import {
   mkdir as mkdir_async,
   mkdtemp as mkdtemp_async,
   readFile as readFile_async,
   writeFile as writeFile_async,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { exists, FOLDER } from '@kwsites/file-exists';

export const isdir = (path: string) => {
   try {
      return exists(path, FOLDER);
   } catch (_e) {
      return false;
   }
};

export const mkdir = async (path: string) => {
   if (exists(path)) {
      return path;
   }

   await mkdir_async(path);
   return path;
};

export const mkdtemp = async () => {
   return mkdtemp_async(join(process.env.TMPDIR || tmpdir(), 'test-tmp-dir-'));
};

export const readFile = async (path: string, encoding: BufferEncoding = 'utf-8') => {
   return readFile_async(path, encoding);
};

export const writeFile = async (
   path: string,
   content: string,
   encoding: BufferEncoding = 'utf-8'
) => {
   await writeFile_async(path, content, encoding);
   return path;
};

export const io = {
   isdir,
   mkdir,
   mkdtemp,
   readFile,
   writeFile,
};

import { readFileSync } from 'fs';
import { PropertyWriterCallback } from './property-writer';
import { propertiesPath } from './properties-path';
import { ExpressAppLike, Reader, Value } from './properties-reader.types';
import { bindToExpress, expressBasePath } from './bind-to-express';
import { getByRoot } from './get-by-root';
import { parseValue } from './parse-value';


type ReadLineTask = {
   section: string;
   properties: Map<string, string>;
}

function newTask(): ReadLineTask {
   return {section: '', properties: new Map()};
}

function append(sourceFile: string | undefined | null, encoding: BufferEncoding, task = newTask()) {
   if (!sourceFile) {
      return task;
   }

   const file = readFileSync(sourceFile, encoding);
   return read(file, task);
}

function read(input: string, task = newTask()) {
   return String(input).split('\n').reduce<ReadLineTask>(
      (task, line) => {
         return readLine(line, task);
      },
      {...task, section: ''}
   );
}

function readLine(line: string, task = newTask()) {
   const trimmed = line.trim();
   if (!trimmed) {
      return task;
   }

   const section = /^\[([^=]+)]$/.exec(trimmed);
   const property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(trimmed);

   if (section) {
      task.section = section[1];
   } else if (property) {
      const currentSection = task.section ? task.section + '.' : '';
      task.properties.set(currentSection + property[1].trim(), property[3].trim());
   }

   return task;
}

export const createPropertiesReader = (
   {
      sourceFile,
      encoding = 'utf-8',
      ...options
   }: {
      encoding?: BufferEncoding;
      sourceFile?: string;
   } = {}
) => {
   const store = append(sourceFile, encoding);

   const instance: Reader = {
      get length() {
         return store.properties.size;
      },

      append(sourceFile?: string | null, enc: BufferEncoding = encoding) {
         append(sourceFile, enc, store);
         return instance;
      },

      clone() {
         const next = createPropertiesReader();
         instance.each(next.set, next);
         return next;
      },

      read(input: string | Buffer) {
         read(typeof input === 'string' ? input : input.toString(encoding), store);

         return instance;
      },

      bindToExpress(app: ExpressAppLike, basePath?: string | null, makePaths = false) {
         return bindToExpress(instance, app, expressBasePath(basePath))
      },

      each(fn: (key: string, value: string) => void, scope?: unknown) {
         for (const [key, value] of store.properties.entries()) {
            fn.call(scope || instance, key, value);
         }

         return instance;
      },

      get(key: string) {
         return parseValue(store.properties.get(key));
      },

      getAllProperties() {
         return getByRoot(store.properties)
      },

      getByRoot(root: string) {
         return getByRoot(store.properties, root);
      },

      getRaw(key: string) {
         return store.properties.has(key) ? store.properties.get(key)! : null;
      },

      path() {
         return propertiesPath(store.properties);
      },

      save(destFile: string, onComplete?: PropertyWriterCallback) {
         throw new Error('Not implemented');
      },

      set(key: string, value: string | number | boolean) {
         store.properties.set(key, String(value));
         return instance;
      }
   };

   return instance;

}

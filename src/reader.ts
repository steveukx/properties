import { readFileSync } from 'node:fs';
import { propertiesPath } from './properties-path';
import { ExpressAppLike, Reader, Value } from './properties-reader.types';
import { bindToExpress, expressBasePath } from './bind-to-express';
import { getByRoot, parsedEntries } from './get-by-root';
import { parseValue } from './parse-value';
import { output } from './output';
import { save } from './save';

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

function read(input: string, task: ReadLineTask): ReadLineTask {
   return String(input).split('\n').reduce<ReadLineTask>(
      (task, line) => {
         return readLine(line, task);
      },
      {...task, section: ''}
   );
}

function readLine(line: string, task: ReadLineTask): ReadLineTask {
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

type AppenderOptions = {
   allowDuplicateSections: boolean;
}

type WriterOptions = {
   saveSections: boolean;
}

export type PropertiesFactoryOptions = {
   encoding?: BufferEncoding;
   sourceFile?: string;
} & Partial<AppenderOptions> & Partial<WriterOptions>;

export const createPropertiesReader = (
   {
      sourceFile,
      encoding = 'utf-8',
      allowDuplicateSections = false,
      saveSections = true,
   }: PropertiesFactoryOptions = {}
) => {
   const store = append(sourceFile, encoding);

   function entries(options?: { parsed?: false | undefined }): MapIterator<[string, string]>;
   function entries(options: { parsed: true }): MapIterator<[string, null | Value]>;
   function entries(options: { parsed?: boolean } = {}): MapIterator<[string, string | null | Value]> {
      return options.parsed === true ? parsedEntries(store.properties) : store.properties.entries();
   }

   const instance: Reader = {
      get length() {
         return store.properties.size;
      },

      append(sourceFile?: string | null, enc: BufferEncoding = encoding) {
         append(sourceFile, enc, store);
         return instance;
      },

      clone() {
         const next = createPropertiesReader({ allowDuplicateSections, encoding, saveSections });
         for (const [key, value] of store.properties.entries()) {
            next.set(key, value);
         }
         return next;
      },

      bindToExpress(app: ExpressAppLike, basePath?: string | null, makePaths = false) {
         return bindToExpress(instance, app, expressBasePath(basePath), makePaths);
      },

      each(fn: (key: string, value: string) => void, scope?: unknown) {
         for (const [key, value] of store.properties.entries()) {
            fn.call(scope || instance, key, value);
         }

         return instance;
      },

      entries,

      get(key: string) {
         return parseValue(store.properties.get(key));
      },

      getAllProperties() {
         return Object.fromEntries(store.properties.entries());
      },

      getByRoot(root: string) {
         return getByRoot(store.properties, root);
      },

      getRaw(key: string) {
         return store.properties.has(key) ? store.properties.get(key)! : null;
      },

      out() {
         return output(store.properties, allowDuplicateSections, saveSections);
      },

      path() {
         return propertiesPath(store.properties);
      },

      read(input: string | Buffer) {
         read(typeof input === 'string' ? input : input.toString(encoding), store);

         return instance;
      },

      save(destFile: string) {
         return save(destFile, instance.out());
      },

      set(key: string, value: string | number | boolean) {
         store.properties.set(key, String(value));
         return instance;
      }
   };

   return instance;

}

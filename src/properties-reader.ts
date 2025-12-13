import { readFileSync, statSync } from 'fs';
import Path from 'path';
import type { AppenderOptions, PropertyRecord } from './property-appender';
import { propertyAppender } from './property-appender';
import type { PropertyWriterOptions } from './property-writer';
import { propertyWriter, PropertiesIterable } from './property-writer';

const has = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty) as (target: object, key: string | symbol) => boolean;

type PropertyAppender = (properties: PropertyRecord, key: string, value: string) => PropertyRecord;
type PropertyWriter = ReturnType<typeof propertyWriter>;

interface PropertiesReaderOptions extends AppenderOptions, PropertyWriterOptions {
   appender?: AppenderOptions | PropertyAppender;
   writer?: PropertyWriterOptions | PropertyWriter;
}

class PropertiesReader implements PropertiesIterable {
   private _encoding: BufferEncoding;
   private _properties: PropertyRecord;
   private _propertiesExpanded: Record<string, any>;
   private _propertyAppender: PropertyAppender;
   private _propertyWriter: PropertyWriter;
   private _section = '';

   constructor (sourceFile?: string | null, encoding?: BufferEncoding, options: PropertiesReaderOptions = {}) {
      this._encoding = typeof encoding === 'string' ? encoding : 'utf-8';
      this._properties = {};
      this._propertiesExpanded = {};

      this._propertyAppender = propertyAppender();
      this._propertyWriter = propertyWriter();

      this.appender(options.appender || options);
      this.writer(options.writer || options);
      this.append(sourceFile, encoding);
   }

   get length (): number {
      return Object.keys(this._properties).length;
   }

   /**
    * Define the property appending mechanism to be used by the instance.
    */
   appender (appender: PropertiesReaderOptions['appender']): this {
      if (typeof appender === 'function') {
         this._propertyAppender = appender;
      }
      else if (typeof appender === 'object' && appender) {
         this._propertyAppender = propertyAppender(appender);
      }

      return this;
   }

   /**
    * Define the property writing mechanism to be used by the instance.
    */
   writer (writer: PropertiesReaderOptions['writer']): this {
      if (typeof writer === 'function') {
         this._propertyWriter = writer;
      }
      else if (typeof writer === 'object' && writer) {
         this._propertyWriter = propertyWriter(writer);
      }

      return this;
   }

   append (sourceFile?: string | null, encoding?: BufferEncoding): this {
      if (sourceFile) {
         const resolvedEncoding: BufferEncoding = typeof encoding === 'string' ? encoding : this._encoding;
         const file = readFileSync(sourceFile, resolvedEncoding);
         this.read(file);
      }

      return this;
   }

   read (input: string | Buffer): this {
      this._section = '';
      ('' + input).split('\n').forEach(this._readLine, this);
      return this;
   }

   private _readLine (propertyString: string): void {
      const trimmed = propertyString.trim();
      if (trimmed) {
         const section = /^\[([^=]+)]$/.exec(trimmed);
         const property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(trimmed);

         if (section) {
            this._section = section[1];
         }
         else if (property) {
            const currentSection = this._section ? this._section + '.' : '';
            this.set(currentSection + property[1].trim(), property[3].trim());
         }
      }
   }

   each (fn: (key: string, value: string) => void, scope?: unknown): this {
      for (const key in this._properties) {
         if (has(this._properties, key)) {
            fn.call(scope || this, key, this._properties[key]);
         }
      }
      return this;
   }

   private _parsed (value: string | null): string | number | boolean | null {
      if (value !== null && value !== '' && !isNaN(value as any)) {
         return +value;
      }

      if (value === 'true' || value === 'false') {
         return value === 'true';
      }

      if (typeof value === 'string') {
         const replacements: Record<string, string> = {'\\n': '\n', '\\r': '\r', '\\t': '\t'};
         return value.replace(/\\[nrt]/g, (key) => replacements[key]);
      }

      return value;
   }

   get (key: string): string | number | boolean | null {
      return this._parsed(this.getRaw(key));
   }

   getRaw (key: string): string | null {
      return has(this._properties, key) ? this._properties[key] : null;
   }

   set (key: string, value: string | number | boolean): this {
      const parsedValue = ('' + value).trim();

      this._properties = this._propertyAppender(this._properties, key, parsedValue);

      const expanded = key.split('.');
      let source: Record<string, any> = this._propertiesExpanded;

      while (expanded.length > 1) {
         const step = expanded.shift() as string;
         if (expanded.length >= 1 && typeof source[step] === 'string') {
            source[step] = {'': source[step]};
         }

         if (!has(source, step)) {
            Object.defineProperty(source, step, { value: {} });
         }

         source = source[step];
      }

      const lastKey = expanded[0];
      if (lastKey === '__proto__') {
         Object.defineProperty(source, lastKey, { value: parsedValue });
      }
      else if (typeof parsedValue === 'string' && typeof source[lastKey] === 'object') {
         source[lastKey][''] = parsedValue;
      }
      else {
         source[lastKey] = parsedValue;
      }

      return this;
   }

   path (): Record<string, any> {
      return this._propertiesExpanded;
   }

   getAllProperties (): PropertyRecord {
      const properties: PropertyRecord = {};
      this.each((key, value) => {
         properties[key] = value;
      });
      return properties;
   }

   clone (): PropertiesReader {
      const propertiesReader = new PropertiesReader(null);
      this.each(propertiesReader.set, propertiesReader);

      return propertiesReader;
   }

   getByRoot (root: string): Record<string, string | number | boolean> {
      const keys = Object.keys(this._properties);
      const outObj: Record<string, string | number | boolean> = {};
      const prefixLength = String(root).length;

      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];

         if (key.indexOf(root) === 0 && key.charAt(prefixLength) === '.') {
            outObj[key.substr(prefixLength + 1)] = this.get(key) as string | number | boolean;
         }
      }

      return outObj;
   }

   bindToExpress (app: { set: (key: string, value: any) => void; locals?: Record<string, any> }, basePath?: string, makePaths?: boolean): this {
      let resolvedBasePath = basePath || process.cwd();

      if (!/\/$/.test(resolvedBasePath)) {
         resolvedBasePath += '/';
      }

      this.each((key, value) => {
         if (value && /\.(path|dir)$/.test(key)) {
            const resolvedValue = Path.resolve(resolvedBasePath, String(value));
            this.set(key, resolvedValue);

            try {
               const directoryPath = /dir$/.test(key) ? resolvedValue : Path.dirname(resolvedValue);
               if (makePaths) {
                  require('mkdirp').sync(directoryPath);
               }
               else if (!statSync(directoryPath).isDirectory()) {
                  throw new Error("Path is not a directory that already exists");
               }
            }
            catch (e) {
               throw new Error("Unable to create directory " + value);
            }
         }

         app.set(key, this.get(key));

         if (/^browser\./.test(key) && app.locals) {
            app.locals[key.substr(8)] = this.get(key);
         }
      });

      app.set('properties', this);

      return this;
   }

   save (destFile: string, onComplete?: Parameters<PropertyWriter>[2]) {
      return this._propertyWriter(this, destFile, onComplete);
   }
}

export = PropertiesReader;

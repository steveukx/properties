import { PropertyWriterCallback } from './property-writer';

export type ExpressAppLike = {
   set(key: string, value: unknown): unknown;
   locals?: Record<string, unknown>;
}

export type Value = number | boolean | string;

type PathLeafValue = Value | undefined;

type PathValue = PathLeafValue & {
   [k: string]: PathValue;
};

export type PathProxy = {
   [k: string]: PathValue;
} & {
   [k: symbol]: unknown;
};

export interface Reader {
   readonly length: number;

   //
   append(sourceFile?: string | null, enc?: BufferEncoding): Reader;

   clone(): Reader;

   //
   read(input: (string | Buffer)): Reader;

   //
   bindToExpress(app: ExpressAppLike, basePath?: (string | null), makePaths?: boolean): void;

   //
   each<T>(fn: (key: string, value: Value) => void, scope?: T): Reader;

   //
   get(key: string): null | Value;

   getAllProperties(): Record<string, Value>;

   //
   getByRoot(root: string): Record<string, Value>;

   //
   getRaw(key: string): string | null;

   //
   path(): PathProxy;

   save(destFile: string, onComplete?: PropertyWriterCallback): void;

   //
   set(key: string, value: Value): Reader
}

import Path from 'path';
import { statSync } from 'fs';
import { ExpressAppLike, Reader } from './properties-reader.types';

export function expressBasePath(basePath?: string | null) {
   let resolvedBasePath = basePath || process.cwd();

   if (!/\/$/.test(resolvedBasePath)) {
      resolvedBasePath += '/';
   }

   return resolvedBasePath;
}

export function bindToExpress(reader: Reader, app: ExpressAppLike, basePath: string, makePaths?: boolean) {
   reader.each((key, value) => {
      if (value && /\.(path|dir)$/.test(key)) {
         const resolvedValue = Path.resolve(basePath, String(value));
         reader.set(key, resolvedValue);

         try {
            const directoryPath = /dir$/.test(key) ? resolvedValue : Path.dirname(resolvedValue);
            if (makePaths) {
               require('mkdirp').sync(directoryPath);
            } else if (!statSync(directoryPath).isDirectory()) {
               throw new Error('Path is not a directory that already exists');
            }
         } catch (e) {
            throw new Error('Unable to create directory ' + value);
         }
      }

      app.set(key, reader.get(key));

      if (/^browser\./.test(key) && app.locals) {
         app.locals[key.substr(8)] = reader.get(key);
      }
   });

   app.set('properties', reader);

   return reader;
}

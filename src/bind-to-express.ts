import { dirname, resolve, sep } from 'node:path';
import { mkdirp } from 'mkdirp';
import { exists, FOLDER } from '@kwsites/file-exists';
import { ExpressAppLike, Nullable, Reader } from './properties-reader.types';

/**
 * Helper to ensure the provided `basePath` has a trailing slash suffix. When omitted
 * or empty, defaults to using the process current working directory.
 *
 * @param basePath
 */
export function expressBasePath(basePath?: Nullable<string>): string {
   return resolve(basePath || process.cwd(), './') + sep;
}

/**
 * Binds properties into the settings for an express app.
 *
 * Where properties have a key ending with either `path` or `dir`, the value of the property
 * resolved relative to the `basePath` directory and optionally (when `makePaths` is `true`)
 * the path will be created.
 *
 * Where a property key starts with `browser.`, the `app.locals` will have a property added
 * (without the `browser.` prefix). Useful for including variables for templating libraries.
 *
 * ```
 * import { propertiesReader, bindToExpress } from 'properties-reader';
 *
 * const props = propertiesReader()
 *    .set('config.dir', './config')
 *    .set('service.username', 'some secret here')
 *    .set('browser.app.name', 'My App');
 *
 * bindToExpress(
 *   props, app, '/bin/my-app', true
 * );
 *
 * app.get('config.dir') === '/bin/my-app/config';
 * app.get('service.username') === 'some secret here';
 * app.get('properties') === props;
 *
 * // only if `app.locals` had already been enabled before using `bindToExpress`
 * app.locals?.['app-name'] === 'My App';
 * ```
 *
 *
 * @param reader
 * @param app
 * @param basePath
 * @param makePaths
 */
export function bindToExpress(reader: Reader, app: ExpressAppLike, basePath: string, makePaths: boolean) {
   for (const [key, value] of reader.entries()) {
      if (value && /\.(path|dir)$/.test(key)) {
         const resolvedValue = resolve(basePath, value);
         reader.set(key, resolvedValue);

         try {
            const directoryPath = /dir$/.test(key) ? resolvedValue : dirname(resolvedValue);
            if (makePaths) {
               mkdirp.sync(directoryPath);
            } else if (!exists(directoryPath, FOLDER)) {
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
   }

   app.set('properties', reader);

   return reader;
}

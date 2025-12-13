import fs from 'fs';

export interface PropertyWriterOptions {
   saveSections?: boolean;
}

export interface PropertiesIterable {
   each: (fn: (key: string, value: string) => void, scope?: unknown) => void;
}

const defaultOptions: PropertyWriterOptions = {
   saveSections: true,
};

type PropertyWriterCallback = ((error: unknown | null, content?: string) => void) | ((content: string) => void);

function flat (props: PropertiesIterable): string[] {
   const out: string[] = [];
   props.each((key, value) => out.push(`${key}=${value}`));
   return out;
}

function section (props: PropertiesIterable): string[] {
   const lines: string[] = [];
   let section: string | null = null;
   props.each(function (key, value) {
      const tokens = key.split('.');
      if (tokens.length > 1) {
         if (section !== tokens[0]) {
            section = tokens[0];
            lines.push('[' + section + ']');
         }
         key = tokens.slice(1).join('.');
      }
      else {
         section = null;
      }

      lines.push(key + '=' + value);
   });
   return lines;
}

export function propertyWriter (userOptions?: PropertyWriterOptions) {
   const options = Object.assign({}, defaultOptions, userOptions || {});

   return (props: PropertiesIterable, destFile: string, onComplete?: PropertyWriterCallback) => {
      const onDone = new Promise<string>((done, fail) => {
         const content = (options.saveSections ? section(props) : flat(props)).join('\n');
         fs.writeFile(destFile, content, (err) => {
            if (err) {
               return fail(err);
            }

            done(content);
         });
      });

      if (typeof onComplete === 'function') {
         if (onComplete.length > 1) {
            onDone.then(
               () => (onComplete as (error: unknown | null, content?: string) => void)(null),
               (e) => (onComplete as (error: unknown, content?: string) => void)(e)
            );
         }
         else {
            onDone.then(onComplete as (value: string) => void);
         }
      }

      return onDone;
   };
}

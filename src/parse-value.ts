import { type ParsedValue } from './properties-reader.types';

export function parseValue(input?: string): ParsedValue {
   const parsedValue = ('' + input).trim();
   switch (parsedValue) {
      case 'undefined':
      case 'null':
         return null;
      case !isNaN(parsedValue as unknown as number) && !!parsedValue && parsedValue:
         return +parsedValue;
      case 'false':
      case 'true':
         return parsedValue === 'true';
      default:
         const replacements: Record<string, string> = {'\\n': '\n', '\\r': '\r', '\\t': '\t'};
         return parsedValue.replace(/\\[nrt]/g, (key) => replacements[key]);
   }
}

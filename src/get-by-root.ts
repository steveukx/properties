import { parseValue } from './parse-value';
import type { ParsedValue } from './properties-reader.types';

export function getByRoot(store: Map<string, string>, root = '') {
   return Object.fromEntries(parsedEntries(store, `${root}.`));
}

export function *parsedEntries(store: Map<string, string>, prefix = ''): MapIterator<[string, ParsedValue]> {
   for (const [storeKey, storeValue] of store.entries()) {
      const key = parsedKey(storeKey, prefix);
      if (key) {
         yield [key, parseValue(storeValue)];
      }
   }
}

function parsedKey(key: string, prefix: string) {
   if (!prefix) {
      return key;
   }
   if (key.startsWith(prefix)) {
      return key.substring(prefix.length);
   }
}

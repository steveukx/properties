import { parseValue } from './parse-value';

export function getByRoot(store: Map<string, string>, root = '') {
   const prefix = root && `${root}.`;
   const length = prefix.length;

   if (!length) {
      return Object.fromEntries(store);
   }

   return Object.fromEntries(
      Array.from(store.entries(), ([key, value]) => {
         return key.startsWith(prefix) ? [[key.substring(length), parseValue(value)]] : [];
      }).flat()
   );
}

import { PropertiesIterator } from './properties-reader.types';

export function output(properties: Map<string, string>, allowDuplicateSections: boolean, saveSections: boolean): PropertiesIterator {
   if (!allowDuplicateSections) {
      properties = collapseSections(properties);
   }

   return saveSections
      ? generatePropertiesWithSections(properties)
      : generatePropertiesWithoutSections(properties);
}

function* generatePropertiesWithoutSections(properties: Map<string, string>) {
   for (const [key, value] of properties.entries()) {
      yield `${key}=${value}`;
   }
}

function* generatePropertiesWithSections(properties: Map<string, string>) {
   let section: null | string = null;
   for (let [key, value] of properties.entries()) {
      const [prefix, ...tokens] = key.split('.');

      if (tokens.length) {
         if (section !== prefix) {
            section = prefix;
            yield `[${section}]`;
         }
         key = tokens.join('.');
      } else {
         section = null;
      }

      yield `${key}=${value}`;
   }
}

function collapseSections(properties: Map<string, string>) {
   const sections = new Map<string, [string, string][]>();

   for (const [key, value] of properties.entries()) {
      const [section] = key.split('.');
      const map = sections.get(section) ?? [];
      map.push([key, value]);
      sections.set(section, map);
   }

   return new Map(Array.from(sections.values()).flat());
}


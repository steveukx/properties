import { type PropertiesFactoryOptions, propertiesReader } from 'properties-reader';

import type { TestContext } from './create-test-context';

export async function propertiesFromFile(
   { file }: TestContext,
   content: string,
   options: Pick<PropertiesFactoryOptions, 'allowDuplicateSections' | 'saveSections'> = {}
) {
   return propertiesReaderFixture('', {
      ...options,
      sourceFile: await file('props.ini', content),
   });
}

export function propertiesReaderFixture(
   content: string | Buffer = '',
   options: Pick<
      PropertiesFactoryOptions,
      'allowDuplicateSections' | 'saveSections' | 'sourceFile'
   > = {}
) {
   const props = propertiesReader(options);
   if (content) {
      props.read(content);
   }
   return props;
}

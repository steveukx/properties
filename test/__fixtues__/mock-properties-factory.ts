import { createPropertiesReader, PropertiesFactoryOptions } from '../../src/reader';
import { TestContext } from './create-test-context';

const legacy = require('old-properties-reader');

export async function propertiesFromFile({file}: TestContext, content: string, options: Pick<PropertiesFactoryOptions, 'allowDuplicateSections' | 'saveSections'> = {}) {
   return propertiesReaderFixture('', {
      ...options,
      sourceFile: await file('props.ini', content),
   });
}

export function propertiesReaderFixture(content: string | Buffer = '', options: Pick<PropertiesFactoryOptions, 'allowDuplicateSections' | 'saveSections' | 'sourceFile'> = {}) {
   const props = createPropertiesReader(options);

   // const props = legacy( options.sourceFile, 'utf8', options);
   if (content) {
      props.read(content);
   }
   return props;
}

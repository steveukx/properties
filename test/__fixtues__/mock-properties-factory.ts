import { createPropertiesReader, PropertiesFactoryOptions } from '../../src/reader';
import { TestContext } from './create-test-context';

export async function mockPropertiesFactory({file}: TestContext, content: string, options: Pick<PropertiesFactoryOptions, 'allowDuplicateSections' | 'saveSections'> = {}) {
   const sourceFile = await file('props.ini', content);

   return createPropertiesReader({
      ...options,
      sourceFile,
   });
}

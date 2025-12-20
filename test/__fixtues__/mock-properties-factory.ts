import { createPropertiesReader } from '../../src/reader';
import { TestContext } from './create-test-context';

export async function mockPropertiesFactory({file}: TestContext, content: string) {
   const sourceFile = await file('props.ini', content);
   return createPropertiesReader({
      sourceFile
   });
}

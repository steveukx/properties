import { createTestContext } from './__fixtues__/create-test-context';
import type { Reader } from 'properties-reader';
import { propertiesFromFile } from './__fixtues__/mock-properties-factory';

describe('section', () => {

   let properties: Reader;

   async function givenTheProperties(content: string) {
      return properties = await propertiesFromFile(await createTestContext(), content);
   }

   it('Able to read URLs as part of a section', async () => {
      await givenTheProperties(`
[foo]
base.api.url=http://blah.com

[trade]
base.api.url=http://google.com

[another]
thing = 123
       `);

      expect(properties.get('foo.base.api.url')).toBe('http://blah.com');
      expect(properties.get('trade.base.api.url')).toBe('http://google.com');
      expect(properties.get('another.thing')).toBe(123);
   });

   it('Able to read file with sections that are already properties', async () => {
      await givenTheProperties(`
         some = thing
         section = value

         [section]
         sub = property
        `);

      expect(properties.get('section')).toBe('value');
      expect(properties.get('section.sub')).toBe('property');
      expect(properties.path().section).toEqual({'': 'value', 'sub': 'property'});
   });

   it('Ignores comment blocks', async () => {
      await givenTheProperties(`

        some = thing

        # section = value
        section = another value

     `);

      expect(properties.get('section')).toBe('another value');
   });

   it('Able to read from a file with sections', async () => {
      await givenTheProperties(`
      some.property = Value

      [section]
      another.property = Something

      [blah]
      another.property = Something Else

      `);

      expect(properties.get('some.property')).toBe('Value');
      expect(properties.get('section.another.property')).toBe('Something');
      expect(properties.path().blah.another.property).toBe('Something Else');
   });

   it('Able use section names with white space', async () => {
      await givenTheProperties(`

         some.property = Value

         [submodule foo]
         another.property = Something

         [some thing in here]
         another.property = Something Else

      `);
      expect(properties.path()['submodule foo'].another.property).toBe('Something');
   });

});

import { createTestContext, TestContext } from './__fixtues__/create-test-context';
import type { PropertiesFactoryOptions, Reader } from 'properties-reader';
import { propertiesFromFile } from './__fixtues__/mock-properties-factory';
import { readFile } from './__fixtues__/io';

describe('writer', () => {

   let properties: Reader;
   let context: TestContext;
   let outputFile: string;

   async function givenTheProperties(content: string, options: Partial<PropertiesFactoryOptions> = {}) {
      return properties = await propertiesFromFile(context, content, options);
   }

   beforeEach(async () => {
      context = await createTestContext();
      outputFile = context.path('out.ini');
   });

   function thePropertiesOutput() {
      return Array.from(properties.out());
   }

   it('Able to stringify properties', async () => {
      await givenTheProperties(`
         property = Value
      `);

      expect(thePropertiesOutput()).toEqual([`property=Value`]);
   });

   it('Able to stringify properties with section', async () => {
      await givenTheProperties(`
         [main]
            property=Value
      `);

      expect(thePropertiesOutput()).toEqual(['[main]', 'property=Value']);
   });

   describe('Able to stringify properties with the few sections', () => {
      const inputContent = `

property1=Value1

[main]
property2=Value2

[second]
property3=Value3

[main]
property4=Value4

      `;

      it('can remove sections from output entirely', async () => {
         await givenTheProperties(inputContent, {saveSections: false});
         expect(thePropertiesOutput()).toEqual([`property1=Value1`,
            'main.property2=Value2',
            'main.property4=Value4',
            `second.property3=Value3`
         ]);
      });

      it('Duplicate sections permitted', async () => {
         await givenTheProperties(inputContent, {allowDuplicateSections: true});

         expect(thePropertiesOutput()).toEqual([`property1=Value1`,
            '[main]',
            'property2=Value2',
            '[second]',
            'property3=Value3',
            '[main]',
            `property4=Value4`]);
      });

      it('Duplicate sections not permitted', async () => {
         await givenTheProperties(inputContent, { /* default behaviour... allowDuplicateSections: false */});

         expect(thePropertiesOutput()).toEqual([
            'property1=Value1',
            '[main]',
            'property2=Value2',
            'property4=Value4',
            '[second]',
            'property3=Value3']);
      });

   });

   it('Able to stringify properties after set', async () => {
      await givenTheProperties('property=Value');

      properties.set('property', 'xxx');
      expect(thePropertiesOutput()).toEqual(['property=xxx']);
   });

   it('Able to stringify properties after set with sections', async () => {
      await givenTheProperties('[main]\nproperty=Value');

      properties.set('main.property', 'xxx');
      expect(thePropertiesOutput()).toEqual(['[main]', 'property=xxx']);
   });

   it('Able to stringify properties after set with sections and dots', async () => {
      await givenTheProperties('[main]\nproperty.one=Value');

      properties.set('main.property.one', 'xxx');
      expect(thePropertiesOutput()).toEqual(['[main]', 'property.one=xxx']);
   });

   it('Maintains unique names when overwriting an existing property', async () => {
      await givenTheProperties(`
         [s1]
         s1foo = 1
         [s2]
         s2foo = 2
      `);

      properties.set('s2.s2foo', 'new');

      expect(thePropertiesOutput()).toEqual([
         '[s1]',
         's1foo=1',
         '[s2]',
         's2foo=new']);
   });

   it('Maintains unique names when adding to an existing section', async () => {
      await givenTheProperties(`
      [s1]
      s1foo = 1
      [s2]
      s2foo = 2
      `);

      properties.set('s1.s1new', 'new');

      expect(thePropertiesOutput()).toEqual([
         '[s1]',
         's1foo=1',
         's1new=new',
         '[s2]',
         's2foo=2']);
   });

   it('Writes to the named file', async () => {
      await givenTheProperties(`
         [foo]
         bar = baz
      `);
      expect(thePropertiesOutput()).toEqual(['[foo]', 'bar=baz'])

      await properties.save(outputFile);
      expect(await readFile(outputFile)).toBe('[foo]\nbar=baz\n');
   });

});

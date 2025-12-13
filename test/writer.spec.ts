import { createTestContext } from './__fixtues__/create-test-context';
import { io } from './__fixtues__/io';
import propertiesReader = require('../src/properties-reader-factory');

describe('writer', () => {

   let properties;
   let context;
   let theSavedProperties;
   let outputFile;

   async function givenTheProperties (content, options) {
      return properties = propertiesReader(
         await context.file('props.ini', content),
         undefined,
         options,
      );
   }

   beforeEach(async () => {
      context = await createTestContext();
      outputFile = context.path('out.ini');
   });

   async function givenThePropertiesAreSaved () {
      return theSavedProperties = await properties.save(outputFile);
   }

   it('Able to stringify properties', async () => {
      await givenTheProperties(`
         property = Value
      `);

      expect(await properties.save(outputFile)).toBe(`property=Value`);
   });

   it('Able to stringify properties with section', async () => {
      await givenTheProperties(`
         [main]
            property=Value
      `);

      expect(await properties.save(outputFile)).toBe('[main]\nproperty=Value');
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
         expect(await properties.save(outputFile)).toBe(`property1=Value1
main.property2=Value2
main.property4=Value4
second.property3=Value3`);
      });

      it('can remove sections from output entirely - writer options', async () => {
         await givenTheProperties(inputContent, {writer: {saveSections: false}});

         await givenThePropertiesAreSaved();
         expect(await properties.save(outputFile)).toBe(`property1=Value1
main.property2=Value2
main.property4=Value4
second.property3=Value3`);
      });

      it('Duplicate sections permitted', async () => {
         await givenTheProperties(inputContent, {allowDuplicateSections: true});

         expect(await properties.save(outputFile)).toBe(`property1=Value1
[main]
property2=Value2
[second]
property3=Value3
[main]
property4=Value4`);
      });

      it('Duplicate sections not permitted', async () => {
         await givenTheProperties(inputContent, { /* default behaviour... allowDuplicateSections: false */});

         expect(await properties.save(outputFile)).toBe(`property1=Value1
[main]
property2=Value2
property4=Value4
[second]
property3=Value3`);
      });

   });

   it('Able to stringify properties after set', async () => {
      await givenTheProperties('property=Value');

      properties.set('property', 'xxx');
      expect(await properties.save(outputFile)).toBe('property=xxx');
   });

   it('Able to stringify properties after set with sections', async () => {
      await givenTheProperties('[main]\nproperty=Value');

      properties.set('main.property', 'xxx');
      expect(await properties.save(outputFile)).toBe('[main]\nproperty=xxx');
   });

   it('Able to stringify properties after set with sections and dots', async () => {
      await givenTheProperties('[main]\nproperty.one=Value');

      properties.set('main.property.one', 'xxx');
      expect(await properties.save(outputFile)).toBe('[main]\nproperty.one=xxx');
   });

   it('Maintains unique names when overwriting an existing property', async () => {
      await givenTheProperties(`
         [s1]
         s1foo = 1
         [s2]
         s2foo = 2
      `);

      properties.set('s2.s2foo', 'new');

      expect(await properties.save(outputFile)).toBe(`[s1]
s1foo=1
[s2]
s2foo=new`);
   });

   it('Maintains unique names when adding to an existing section', async () => {
      await givenTheProperties(`
      [s1]
      s1foo = 1
      [s2]
      s2foo = 2
      `);

      properties.set('s1.s1new', 'new');

      expect(await properties.save(outputFile)).toBe(`[s1]
s1foo=1
s1new=new
[s2]
s2foo=2`);
   });

   it('Returns the same content as is saved', async () => {
      await givenTheProperties(`
         [foo]
         bar = baz
      `);
      const saved = await properties.save(outputFile);
      expect(saved).toBe(await io.readFile(outputFile));
      expect(saved).toBe('[foo]\nbar=baz');
   });

});

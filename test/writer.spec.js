const expect = require('expect.js');

describe('writer', () => {

   let properties;
   let theSavedProperties;

   const tempFile = require('./utils/temporary-file');
   const {givenFilePropertiesReader} = require('./utils/bdd');

   function givenTheProperties (content, appender) {
      return properties = givenFilePropertiesReader(content, appender);
   }

   async function givenThePropertiesAreSaved () {
      const filePath = tempFile.pushFile();
      await properties.save(filePath);
      return theSavedProperties = tempFile.readFile(filePath);
   }

   afterEach(() => {
      tempFile.tearDown();
      properties = theSavedProperties = undefined;
   });

   it('Able to stringify properties', async () => {
      givenTheProperties(`
         property = Value
      `);

      await givenThePropertiesAreSaved();
      expect(theSavedProperties).to.have.length(1);
      expect(theSavedProperties).to.eql(['property=Value']);
   });

   it('Able to stringify properties with section', async () => {
      givenTheProperties(`
         [main]
            property=Value
      `);

      await givenThePropertiesAreSaved();
      expect(theSavedProperties).to.have.length(2);
      expect(theSavedProperties).to.eql(['[main]', 'property=Value']);
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
         givenTheProperties(inputContent, { saveSections: false });

         await givenThePropertiesAreSaved();
         expect(theSavedProperties).to.eql([
            'property1=Value1',
            'main.property2=Value2',
            'main.property4=Value4',
            'second.property3=Value3',
         ]);
      });

      it('Duplicate sections permitted', async () => {
         givenTheProperties(inputContent, { allowDuplicateSections: true });

         await givenThePropertiesAreSaved();
         expect(theSavedProperties).to.eql([
            'property1=Value1',
            '[main]',
            'property2=Value2',
            '[second]',
            'property3=Value3',
            '[main]',
            'property4=Value4',
         ]);
         expect(theSavedProperties).to.eql(inputContent.trim().split('\n').filter(Boolean));
      });

      it('Duplicate sections not permitted', async () => {
         givenTheProperties(inputContent, { /* default behaviour... allowDuplicateSections: false */ });

         await givenThePropertiesAreSaved();
         expect(theSavedProperties).to.eql([
            'property1=Value1',
            '[main]',
            'property2=Value2',
            'property4=Value4',
            '[second]',
            'property3=Value3',
         ]);
      });

   });

   it('Able to stringify properties after set', async () => {
      givenTheProperties('property=Value');

      properties.set('property', 'xxx');
      await givenThePropertiesAreSaved();

      expect(theSavedProperties).to.eql(['property=xxx']);
   });

   it('Able to stringify properties after set with sections', async () => {
      givenTheProperties('[main]\nproperty=Value');

      properties.set('main.property', 'xxx');
      await givenThePropertiesAreSaved();
      expect(theSavedProperties).to.eql(['[main]', 'property=xxx']);
   });

   it('Able to stringify properties after set with sections and dots', async () => {
      givenTheProperties('[main]\nproperty.one=Value');

      properties.set('main.property.one', 'xxx');
      await givenThePropertiesAreSaved();

      expect(theSavedProperties).to.eql(['[main]', 'property.one=xxx']);
   });

   it('Maintains unique names when overwriting an existing property', async () => {
      givenTheProperties(`
      [s1]
      s1foo = 1
      [s2]
      s2foo = 2
      `);

      properties.set('s2.s2foo', 'new');

      await givenThePropertiesAreSaved();

      expect(theSavedProperties).to.eql([
         '[s1]',
         's1foo=1',
         '[s2]',
         's2foo=new'
      ]);
   });

   it('Maintains unique names when adding to an existing section', async () => {
      givenTheProperties(`
      [s1]
      s1foo = 1
      [s2]
      s2foo = 2
      `);

      properties.set('s1.s1new', 'new');

      await givenThePropertiesAreSaved();

      expect(theSavedProperties).to.eql([
         '[s1]',
         's1foo=1',
         's1new=new',
         '[s2]',
         's2foo=2'
      ]);

   });


});

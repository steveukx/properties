const expect = require('expect.js');

describe('writer', () => {

   let properties;
   let theSavedProperties;

   const tempFile = require('./utils/temporary-file');
   const {givenFilePropertiesReader} = require('./utils/bdd');

   function givenTheProperties (content, options) {
      return properties = givenFilePropertiesReader(content, options);
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

   it('Able to stringify properties with the few sections', async () => {
      const inputContent = `

property1=Value1

[main]
property2=Value2

[second]
property3=Value3

[main]
property4=Value4

      `;
      givenTheProperties(inputContent);

      await givenThePropertiesAreSaved();
      expect(theSavedProperties).to.have.length(7);
      expect(theSavedProperties).to.eql(inputContent.trim().split('\n').filter(Boolean));
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

   it('Able to stringify properties after set without sections and dots', async () => {
      givenTheProperties('main.property.one=Value', {write_sections: false});

      properties.set('main.property.one', 'xxx');
      await givenThePropertiesAreSaved();

      expect(theSavedProperties).to.eql(['main.property.one=xxx']);
   });


});

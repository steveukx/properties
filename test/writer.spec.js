const expect = require('expect.js');

describe('writer', () => {

   let properties;

   const tempFile = require('./utils/temporary-file');
   const {givenFilePropertiesReader} = require('./utils/bdd');

   function givenTheProperties (content) {
      return properties = givenFilePropertiesReader(content);
   }

   beforeEach(() => {
   });

   afterEach(() => tempFile.tearDown());

   it('test Able to stringify properties', () => {
      givenTheProperties(`
         property = Value
      `);

      const propertiesStringsArray = properties._stringifyProperties();
      expect(propertiesStringsArray).to.have.length(1);
      expect(propertiesStringsArray).to.eql(['property=Value']);
   });

   it('test Able to stringify properties with section', () => {
      givenTheProperties(`
         [main]
            property=Value
      `);

      const propertiesStringsArray = properties._stringifyProperties();
      expect(propertiesStringsArray).to.have.length(2);
      expect(propertiesStringsArray).to.eql(['[main]', 'property=Value']);
   });

   it( 'test Able to stringify properties with the few sections', () => {
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

      const propertiesStringsArray = properties._stringifyProperties();
      expect(propertiesStringsArray).to.have.length(7);
      expect(propertiesStringsArray).to.eql(inputContent.trim().split('\n').filter(Boolean));
   });

   it( 'test Able to stringify properties after set', () => {
      givenTheProperties('property=Value');

      properties.set('property', 'xxx');

      expect(properties._stringifyProperties()).to.eql(['property=xxx']);
   });

   it( 'test Able to stringify properties after set with sections', () => {
      givenTheProperties('[main]\nproperty=Value');

      properties.set('main.property', 'xxx');
      expect(properties._stringifyProperties()).to.eql(['[main]', 'property=xxx']);
   });

   it( 'test Able to stringify properties after set with sections and dots', () => {
      givenTheProperties('[main]\nproperty.one=Value');

      properties.set('main.property.one', 'xxx');

      expect(properties._stringifyProperties()).to.eql(['[main]', 'property.one=xxx']);
   });


});

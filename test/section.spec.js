const expect = require('expect.js');

describe('section', () => {

   let properties;

   const tempFile = require('./utils/temporary-file');
   const {givenFilePropertiesReader} = require('./utils/bdd');

   function givenTheProperties (content) {
      return properties = givenFilePropertiesReader(content);
   }

   beforeEach(() => {
   });

   afterEach(() => tempFile.tearDown());

   it('test Able to read URLs as part of a section', () => {
      givenTheProperties(`
[foo]
base.api.url=http://blah.com

[trade]
base.api.url=http://google.com

[another]
thing = 123
       `);

      expect(properties.get('foo.base.api.url')).to.be('http://blah.com');
      expect(properties.get('trade.base.api.url')).to.be('http://google.com');
      expect(properties.get('another.thing')).to.be(123);
   });

   it('test Able to read file with sections that are already properties', () => {
      givenTheProperties(`
         some = thing
         section = value

         [section]
         sub = property
        `);

      expect(properties.get('section')).to.be('value');
      expect(properties.get('section.sub')).to.be('property');
      expect(properties.path().section).to.eql({'': 'value', 'sub': 'property'});
   });

   it('test Ignores comment blocks', () => {
      givenTheProperties(`

        some = thing
        
        # section = value
        section = another value

     `);

      expect(properties.get('section')).to.be('another value');
   });

   it('test Able to read from a file with sections', () => {
      givenTheProperties(`
      some.property = Value
      
      [section]
      another.property = Something
      
      [blah]
      another.property = Something Else
      
      `);

      expect(properties.get('some.property')).to.be('Value');
      expect(properties.get('section.another.property')).to.be('Something');
      expect(properties.path().blah.another.property).to.be('Something Else');
   });

   it('test Able use section names with white space', () => {
      givenTheProperties(`
      
         some.property = Value

         [submodule foo]
         another.property = Something

         [some thing in here]
         another.property = Something Else

      `);
      expect(properties.path()['submodule foo'].another.property).to.be('Something');
   });

});

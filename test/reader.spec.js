const expect = require('expect.js');
const {spy} = require('sinon');

describe('Reader', () => {

   let properties;

   const tempFile = require('./utils/temporary-file');
   const {givenFilePropertiesReader} = require('./utils/bdd');

   function givenTheProperties (content) {
      return properties = givenFilePropertiesReader(content);
   }

   beforeEach(() => {
   });

   afterEach(() => tempFile.tearDown());

   it('Able to read from a file', () => {
      givenTheProperties('some.property=Value');
      expect(properties.get('some.property')).to.be('Value');
   });

   it('Merges multiple files', () => {
      givenTheProperties('some.property=Value');

      tempFile('[section]\nsome.property=Another Value');
      properties.append(tempFile.files[tempFile.files.length - 1]);

      expect(properties.get('section.some.property')).to.be('Another Value');
      expect(properties.get('some.property')).to.be('Value');
   });

   it('Runs a function across all items in the reader', () => {
      givenTheProperties(
         'a = 123\n' +
         'b = true\n'
      );

      assertionsFor(spy(), properties, (s, c) => properties.each(s));
      assertionsFor(spy(), {a: 'bcd'}, (s, c) => properties.each(s, c));

      function assertionsFor (theSpy, theContext, run) {
         run(theSpy, theContext);

         expect(theSpy.callCount).to.be(2);
         expect(theSpy.calledWith('a', '123')).to.be.ok();
         expect(theSpy.calledWith('b', 'true')).to.be.ok();
         expect(theSpy.alwaysCalledOn(theContext)).to.be.ok();
      }
   });

   it('Attempts type coercion', () => {
      givenTheProperties(
         'a = 123\n' +
         'b = true\n' +
         'c = false\n' +
         'd = 0.1');
      expect(properties.get('b')).to.be(true);
      expect(properties.get('c')).to.be(false);
      expect(properties.get('a')).to.be(123);
      expect(properties.get('d')).to.be(0.1);
   });

   it('Correctly handles values that are nothing but whitespace', () => {
      givenTheProperties('a =    \n');
      expect(properties.getRaw('a')).to.be('');
   });

   it('Allows access to non-parsed values', () => {
      givenTheProperties(`
         a = 123
         b = true
         c = false
         d = 0.1
      `);
      expect(properties.getRaw('b')).to.be('true');
      expect(properties.getRaw('c')).to.be('false');
      expect(properties.getRaw('a')).to.be('123');
      expect(properties.getRaw('d')).to.be('0.1');
   });

   it('Properties are trimmed when parsed', () => {
      givenTheProperties(`
         some.property =Value
         foo.bar = A Value`);

      expect(properties.get('some.property')).to.be('Value');
      expect(properties.get('foo.bar')).to.be('A Value');
   });

   it('Blank lines are ignored', () => {
      givenTheProperties('\n\nsome.property=Value\n\nfoo.bar = A Value');

      expect(properties.length).to.be(2);
   });

   it('Properties can be read back via their dot notation names', () => {
      givenTheProperties('\n\nsome.property=Value\n\nfoo.bar = A Value');

      expect(properties.path().some.property).to.be('Value');
      expect(properties.path().foo.bar).to.be('A Value');
   });

   it('Sets properties into an app', () => {
      const app = {set: spy()};
      givenTheProperties(`
         some.property=Value
         foo.bar = A Value`).bindToExpress(app);

      expect(app.set.withArgs('properties', properties).calledOnce).to.be.ok();
      expect(app.set.withArgs('some.property', 'Value').calledOnce).to.be.ok();
      expect(app.set.withArgs('foo.bar', 'A Value').calledOnce).to.be.ok();
   });

   it('Permits escaped new line characters', () => {
      givenTheProperties('\n\nsome.property= Multi\\n Line \\nString \nfoo.bar = A Value');

      // parsed access modifies the new line characters
      expect(properties.get('foo.bar')).to.be('A Value');
      expect(properties.get('some.property')).to.be('Multi\n Line \nString');

      // raw access does not modify the new line characters
      expect(properties.getRaw('some.property')).to.be('Multi\\n Line \\nString');
      expect(properties.path().some.property).to.be('Multi\\n Line \\nString');
   });

   it('Returns null when getting a missing property', () => {
      givenTheProperties('prop = value');

      // parsed access modifies the new line characters
      expect(properties.get('prop')).to.be('value');
      expect(properties.get('missing')).to.be(null);
   });

   it('getByRoot when getting a bunch of objects', () => {
      givenTheProperties(`
         root.sect.a = 1
         root.sect.b = bar
         root.path.b = true
         root.path.c = false
         root.path.d = 0.1
      `);

      expect(properties.getByRoot('root.path').b).to.be(true);
      expect(properties.getByRoot('root.path').c).to.be(false);

      expect(properties.getByRoot('root.sect')).to.eql(
         {
            a: 1,
            b: 'bar'
         }
      );
   });

   it('getByRoot when names are sub strings', () => {
      givenTheProperties(`

         root.sect.a = 1
         root.section.b = bar
         root.sect.c = false
         root.section.d = 0.1

         `);

      expect(properties.getByRoot('root.sect')).to.eql({
         a: 1,
         c: false
      });
   });

   it('getAllProperties returns properties map', () => {
      givenTheProperties(`

         root.a.b = Hello
         some.thing = Else

      `);

      expect(properties.getAllProperties()).to.eql({
         'root.a.b': "Hello",
         'some.thing': 'Else'
      });
   });

   it('getAllProperties is immutable', () => {
      givenTheProperties(`

         root.a.b = Hello
         some.thing = Else

      `);

      const all = properties.getAllProperties();
      all['root.a.b'] = 'New Value';

      expect(properties.getAllProperties()).to.eql({
         'root.a.b': "Hello",
         'some.thing': 'Else'
      });
   });

});

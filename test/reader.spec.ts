import { createTestContext, TestContext } from './__fixtues__/create-test-context';
import { Reader } from '../src/properties-reader.types';
import { mockPropertiesFactory } from './__fixtues__/mock-properties-factory';

describe('Reader', () => {

   let properties: Reader;
   let context: TestContext;

   async function givenTheProperties (content: string) {
      return properties = await mockPropertiesFactory(context, content);
   }

   beforeEach(async () => context = await createTestContext());

   it('Able to read from a file', async () => {
      await givenTheProperties('some.property=Value');
      expect(properties.get('some.property')).toBe('Value');
   });

   it('Merges multiple files', async () => {
      await givenTheProperties('some.property=Value');

      properties.append(
         await context.file('more-props.ini', `
            [section]
            some.property = Another Value
         `)
      );

      expect(properties.get('section.some.property')).toBe('Another Value');
      expect(properties.get('some.property')).toBe('Value');
   });

   it('Runs a function across all items in the reader', async () => {
      await givenTheProperties(
         'a = 123\n' +
         'b = true\n'
      );

      assertionsFor(jest.fn(), properties, (s, c) => properties.each(s));
      assertionsFor(jest.fn(), {a: 'bcd'}, (s, c) => properties.each(s, c));

      function assertionsFor<T, F extends jest.Mock> (theSpy: F, theContext: T, run: (s: F, c: T) => void) {
         run(theSpy, theContext);

         expect(theSpy).toHaveBeenCalledWith('a', '123');
         expect(theSpy).toHaveBeenCalledWith('b', 'true');
         expect(theSpy.mock.instances).toEqual([theContext, theContext]);
      }
   });

   it('Attempts type coercion', async () => {
      await givenTheProperties(`
         a = 123
         b = true
         c = false
         d = 0.1
      `);
      expect(properties.get('b')).toBe(true);
      expect(properties.get('c')).toBe(false);
      expect(properties.get('a')).toBe(123);
      expect(properties.get('d')).toBe(0.1);
   });

   it('Correctly handles values that are nothing but whitespace', async () => {
      await givenTheProperties('a =    \n');
      expect(properties.getRaw('a')).toBe('');
   });

   it('Allows access to non-parsed values', async () => {
      await givenTheProperties(`
         a = 123
         b = true
         c = false
         d = 0.1
      `);
      expect(properties.getRaw('b')).toBe('true');
      expect(properties.getRaw('c')).toBe('false');
      expect(properties.getRaw('a')).toBe('123');
      expect(properties.getRaw('d')).toBe('0.1');
   });

   it('Properties are trimmed when parsed', async () => {
      await givenTheProperties(`
         some.property =Value
         foo.bar = A Value`);

      expect(properties.get('some.property')).toBe('Value');
      expect(properties.get('foo.bar')).toBe('A Value');
   });

   it('Blank lines are ignored', async () => {
      await givenTheProperties('\n\nsome.property=Value\n\nfoo.bar = A Value');

      expect(properties.length).toBe(2);
   });

   it('Properties can be read back via their dot notation names', async () => {
      await givenTheProperties('\n\nsome.property=Value\n\nfoo.bar = A Value');

      expect(properties.path().some?.property).toBe('Value');
      expect(properties.path().foo?.bar).toBe('A Value');
   });

   it('Sets properties into an app', async () => {
      const set = jest.fn();
      (await givenTheProperties(`
         some.property=Value
         foo.bar = A Value
      `)).bindToExpress({set});

      expect(set).toHaveBeenCalledWith('properties', properties);
      expect(set).toHaveBeenCalledWith('some.property', 'Value');
      expect(set).toHaveBeenCalledWith('foo.bar', 'A Value');
   });

   it('Permits escaped new line characters', async () => {
      await givenTheProperties('\n\nsome.property= Multi\\n Line \\nString \nfoo.bar = A Value');

      // parsed access modifies the new line characters
      expect(properties.get('foo.bar')).toBe('A Value');
      expect(properties.get('some.property')).toBe('Multi\n Line \nString');

      // raw access does not modify the new line characters
      expect(properties.getRaw('some.property')).toBe('Multi\\n Line \\nString');
      expect(properties.path().some?.property).toBe('Multi\\n Line \\nString');
   });

   it('Returns null when getting a missing property', async () => {
      await givenTheProperties('prop = value');

      // parsed access modifies the new line characters
      expect(properties.get('prop')).toBe('value');
      expect(properties.get('missing')).toBe(null);
   });

   it('getByRoot when getting a bunch of objects', async () => {
      await givenTheProperties(`
         root.sect.a = 1
         root.sect.b = bar
         root.path.b = true
         root.path.c = false
         root.path.d = 0.1
      `);

      expect(properties.getByRoot('root.path')).toEqual({
         b: true,
         c: false,
         d: 0.1,
      });
      expect(properties.getByRoot('root.sect')).toEqual({
         a: 1,
         b: 'bar'
      });
   });

   it('getByRoot when names are sub strings', async () => {
      await givenTheProperties(`

         root.sect.a = 1
         root.section.b = bar
         root.sect.c = false
         root.section.d = 0.1

      `);

      expect(properties.getByRoot('root.sect')).toEqual({
         a: 1,
         c: false
      });
   });

   it('getAllProperties returns properties map', async () => {
      await givenTheProperties(`

         root.a.b = 1
         some.thing = Else

      `);

      expect(properties.getAllProperties()).toEqual({
         'root.a.b': '1',
         'some.thing': 'Else'
      });
   });

   it('getAllProperties is immutable', async () => {
      await givenTheProperties(`

         root.a.b = Hello
         some.thing = Else

      `);

      const all = properties.getAllProperties();
      all['root.a.b'] = 'New Value';

      expect(properties.getAllProperties()).toEqual({
         'root.a.b': "Hello",
         'some.thing': 'Else'
      });
   });

});

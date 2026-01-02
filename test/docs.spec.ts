import { Reader } from '../src/properties-reader.types';
import { propertiesReader } from '../src';

describe('Docs', () => {

   let properties: Reader;
   const FILE = `
      [some]
      property.name = true

      [another]
      property = hello
   `;

   beforeEach(() => {
      properties = propertiesReader().read(FILE);
   })

   it('fully qualified', async () => {
      expect(properties.get('some.property.name')).toBe(true);
      expect(properties.get('another.property')).toBe('hello');
   });

   it('object path', async () => {
      expect(properties.path().some?.property?.name).toBe('true');
      expect(properties.path().another?.property).toBe('hello');
   });

   it('properties object', async () => {
      expect(properties.getAllProperties()).toEqual({
         'some.property.name': 'true',
         'another.property': 'hello',
      });
   });

   it('properties by root object', async () => {
      expect(properties.getByRoot('another')).toEqual({ property: 'hello' });
      expect(properties.getByRoot('some')['property.name']).toBe(true);
      expect(properties.getByRoot('some.property')['name']).toBe(true);
   });

   it('properties as entries - default strings', async () => {
      const spy = jest.fn();
      for (const [key, value] of properties.entries()) {
         spy(key, value);
      }

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('some.property.name', 'true');
      expect(spy).toHaveBeenCalledWith('another.property', 'hello');
   });

   it('properties as entries - parsed', async () => {
      const spy = jest.fn();
      for (const [key, value] of properties.entries({ parsed: true })) {
         spy(key, value);
      }

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('some.property.name', true);
      expect(spy).toHaveBeenCalledWith('another.property', 'hello');
   });

   it('gets the output', async () => {
      const lines = Array.from(properties.out());

      expect(lines).toEqual([
         '[some]',
         'property.name=true',
         '[another]',
         'property=hello'
      ]);
   });

});

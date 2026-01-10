import { propertiesReaderFixture } from './__fixtues__/mock-properties-factory';
import { Reader } from '../src/properties-reader.types';

describe('clone', () => {

   function output(reader: Reader) {
      return Array.from(reader.out()).join('\n');
   }

   it('Cloned reader outputs with same settings', async () => {
      const p1 = propertiesReaderFixture(`
         [section]
         prop = value
      `);
      const p2 = p1.clone();

      expect(output(p2)).toBe(output(p1));
      expect(p2.get('section.prop')).toBe('value');
   });

   it('Cloned reader does not mutate original', async () => {
      const p1 = propertiesReaderFixture(`
         [section]
         prop = value
      `);
      const p2 = p1.clone();
      p2.set('section.prop', 'changed');

      expect(p1.get('section.prop')).toBe('value');
      expect(p2.get('section.prop')).toBe('changed');
   });

});

import { propertiesReaderFixture } from './__fixtues__/mock-properties-factory';

describe('getRaw', () => {
   it('Handles missing values', async () => {
      const reader = propertiesReaderFixture();
      expect(reader.getRaw('a')).toBe(null);
   });

   it('Correctly handles values that are nothing but whitespace', async () => {
      const reader = propertiesReaderFixture('a =    \n');
      expect(reader.getRaw('a')).toBe('');
   });

   it('Allows access to non-parsed values', async () => {
      const properties = propertiesReaderFixture(`
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
});

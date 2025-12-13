import { createTestContext } from './__fixtues__/create-test-context';
import propertiesReader = require('../src/properties-reader-factory');

describe('prototype-pollution', () => {
   let context;

   beforeEach(async () => {
      context = await createTestContext();
   });

   it('does not pollute global Object.prototype', async () => {
      const file = `
         [__proto__]
            polluted = polluted
            parsed = true
      `;
      const props = propertiesReader(await context.file('props.ini', file));

      expect(({}).polluted).toBeUndefined();
      expect(props.path().__proto__.polluted).toBe('polluted');
      expect(props.getRaw('__proto__.polluted')).toBe('polluted');
      expect(props.get('__proto__.polluted')).toBe('polluted');
      expect(props.getRaw('__proto__.parsed')).toBe('true');
      expect(props.get('__proto__.parsed')).toBe(true);
   });

   it('does not pollute global Object.prototype with assignment to proto', async () => {
      const file = `
         __proto__ = 10
      `;
      const props = propertiesReader(await context.file('props-x.ini', file));

      expect({}['']).toBeUndefined();
      expect(props.path().__proto__).toBe('10');
   });

});

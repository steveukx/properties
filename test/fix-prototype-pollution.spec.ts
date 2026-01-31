import { propertiesReaderFixture } from './__fixtues__/mock-properties-factory';

function anObjectLiteral(): Record<string, string> {
   return {};
}

describe('prototype-pollution', () => {
   it('does not pollute global Object.prototype', async () => {
      const file = `
         [__proto__]
            polluted = polluted
            parsed = true
      `;
      const props = propertiesReaderFixture(file);

      expect(anObjectLiteral().polluted).toBeUndefined();
      expect(props.path().__proto__.polluted).toBe('polluted');
      expect(props.getRaw('__proto__.polluted')).toBe('polluted');
      expect(props.get('__proto__.polluted')).toBe('polluted');
      expect(props.getRaw('__proto__.parsed')).toBe('true');
      expect(props.get('__proto__.parsed')).toBe(true);
      expect(anObjectLiteral().polluted).toBeUndefined();
   });

   it('does not pollute global Object.prototype with assignment to proto', async () => {
      const file = `
         __proto__ = 10
      `;
      const props = propertiesReaderFixture(file);

      expect(anObjectLiteral()['']).toBeUndefined();
      expect(props.path().__proto__).toBe('10');
      expect(anObjectLiteral()['']).toBeUndefined();
   });
});

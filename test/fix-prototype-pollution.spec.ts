import { propertiesReader } from '../src';

describe('prototype-pollution', () => {
   it('does not pollute global Object.prototype', async () => {
      const file = `
         [__proto__]
            polluted = polluted
            parsed = true
      `;
      const props = propertiesReader().read(file);

      expect(({} as any).polluted).toBeUndefined();
      expect(props.path().__proto__.polluted).toBe('polluted');
      expect(props.getRaw('__proto__.polluted')).toBe('polluted');
      expect(props.get('__proto__.polluted')).toBe('polluted');
      expect(props.getRaw('__proto__.parsed')).toBe('true');
      expect(props.get('__proto__.parsed')).toBe(true);
      expect(({} as any).polluted).toBeUndefined();
   });

   it('does not pollute global Object.prototype with assignment to proto', async () => {
      const file = `
         __proto__ = 10
      `;
      const props = propertiesReader().read(file);

      expect(({} as any)['']).toBeUndefined();
      expect(props.path().__proto__).toBe('10');
      expect(({} as any)['']).toBeUndefined();
   });

});

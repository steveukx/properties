import { propertiesReaderFixture } from './__fixtues__/mock-properties-factory';

describe('path', () => {

   it('Properties can be read back via their dot notation names', async () => {
      const properties = propertiesReaderFixture(`
         some.property=Value
         foo.bar = A Value
      `);

      expect(properties.path().some?.property).toBe('Value');
      expect(properties.path().foo?.bar).toBe('A Value');
   });

   it('Invalid paths resolve to undefined', async () => {
      const properties = propertiesReaderFixture(`
         some.property=Value
         foo.bar = A Value
      `);

      expect(() => (properties.path() as any).invalid.property).toThrow();
      expect((properties.path() as any).some.invalid).toBeUndefined();
      expect(properties.path().invalid).toBeUndefined();
   });

   it('Caters for property and section of same name', async () => {
      const properties = propertiesReaderFixture(`
         alpha = aaa
         alpha.beta = bbb
         gamma.delta = ddd
         gamma.delta.epsilon = eee
      `);
      const path = properties.path();

      expect(path.alpha).toEqual({ '': 'aaa', 'beta': 'bbb'});
      expect(path.alpha?.beta).toEqual('bbb');
   });

   it('Caters for inverse specifying property and section of same name', async () => {
      const properties = propertiesReaderFixture(`
         alpha.beta = bbb
         alpha = aaa
         gamma.delta.epsilon = eee
         gamma.delta = ddd
      `);

      const path = properties.path();
      expect(path.gamma).toEqual({ delta: { '': 'ddd', 'epsilon': 'eee' }});
      expect(path.alpha.beta).toEqual('bbb');
      expect(path.alpha).toEqual({ '': 'aaa', 'beta': 'bbb' });
   });

});

const {createTestContext} = require('./__fixtues__/create-test-context');
const {io} = require('./__fixtues__/io');

const propertiesReader = require('../');

describe('bind-to-server', () => {

   let context;
   let app;

   beforeEach(async () => {
      context = await createTestContext();
      app = {
         set: jest.fn(),
      };
   });
   afterEach(() => jest.restoreAllMocks());

   it('Creates directories when necessary - absolute paths', async () => {
      const dirPath = context.path('foo');
      const file = `
         some.property.dir = ${ dirPath }
         foo.bar = A Value
      `;

      propertiesReader(await context.file('properties.ini', file))
         .bindToExpress(app, null, true);

      expect(io.isdir(dirPath)).toBe(true);
   });

   it('Does not create directories when already present', async () => {
      const dirPath = await context.dir('foo');
      const file = `
         some.property.dir = ${ dirPath }
         foo.bar = A Value
      `;

      propertiesReader(await context.file('properties.ini', file))
         .bindToExpress(app, null, true);

      expect(io.isdir(dirPath)).toBe(true);
   });

   it('Creates directories when necessary - relative paths', async () => {
      jest.spyOn(process, 'cwd').mockReturnValue(context.root);

      const dirName = 'bar';
      const dirPath = context.path(dirName);
      const file = `
         some.property.dir = ${ dirName }
         foo.bar = A Value
      `;

      propertiesReader(await context.file('properties.ini', file))
         .bindToExpress(app, null, true);

      expect(io.isdir(dirPath)).toBe(true);
   });

   it('Creates directories when necessary - relative path to explicit working directory', async () => {
      const dirName = 'bar';
      const dirPath = context.path(dirName);
      const file = `
         some.property.dir = ${ dirName }
         foo.bar = A Value
      `;

      propertiesReader(await context.file('properties.ini', file))
         .bindToExpress(app, context.root, true);

      expect(io.isdir(dirPath)).toBe(true);
   });

});


import { createTestContext, TestContext } from './__fixtues__/create-test-context';
import { io } from './__fixtues__/io';
import propertiesReader = require('../src/properties-reader-factory');

describe('bind-to-server', () => {

   let context: TestContext;
   const app = {
      set: jest.fn(),
   };

   beforeEach(async () => (context = await createTestContext()));
   afterEach(() => jest.restoreAllMocks());

   it('Creates directories when necessary - absolute paths', async () => {
      const dirPath = context.path('foo');
      const file = `
         some.property.dir = ${dirPath}
         foo.bar = A Value
      `;

      propertiesReader(await context.file('properties.ini', file))
         .bindToExpress(app, null, true);

      expect(io.isdir(dirPath)).toBe(true);
   });

   it('Does not create directories when already present', async () => {
      const dirPath = await context.dir('foo');
      const file = `
         some.property.dir = ${dirPath}
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
         some.property.dir = ${dirName}
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
         some.property.dir = ${dirName}
         foo.bar = A Value
      `;

      propertiesReader(await context.file('properties.ini', file))
         .bindToExpress(app, context.root, true);

      expect(io.isdir(dirPath)).toBe(true);
   });

});

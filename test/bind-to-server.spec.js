const expect = require('expect.js');
const {spy} = require('sinon');

describe('bind-to-server', () => {

   let properties;

   const tempFile = require('./utils/temporary-file');
   const {givenFilePropertiesReader} = require('./utils/bdd');

   function givenTheProperties (content) {
      return properties = givenFilePropertiesReader(content);
   }

   beforeEach(() => {
   });

   afterEach(() => tempFile.tearDown());

   it('test Creates directories when necessary - absolute paths', () => {
      const dirPath = tempFile.pushDir('/tmp/' + Math.floor(Math.random() * 1e10).toString(16));
      const app = {set: spy()};

      givenTheProperties(`

         some.property.dir = ${ dirPath }

         foo.bar = A Value

      `).bindToExpress(app, null, true);

      expect(require('fs').statSync(dirPath).isDirectory()).to.be.ok();
   });

   it('test Creates directories when necessary - relative paths', () => {
      const dirName = Math.floor(Math.random() * 1e10).toString(16);
      const dirBase = process.cwd();
      const dirPath = tempFile.pushDir(dirBase + '/' + dirName);
      const app = {set: spy()};

      givenTheProperties(`

         some.property.dir = ${ dirName }

         foo.bar = A Value

      `).bindToExpress(app, dirBase, true);

      expect(require('fs').statSync(dirPath).isDirectory()).to.be.ok();
   });


});


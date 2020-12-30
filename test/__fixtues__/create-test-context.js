const {join} = require('path');
const {realpathSync} = require('fs');
const {io} = require('./io');

module.exports.createTestContext = async function createTestContext () {
   const root = await io.mkdtemp();

   const context = {
      path (...segments) {
         return join(root, ...segments);
      },
      async dir (...paths) {
         if (!paths.length) {
            return root;
         }

         return await io.mkdir(context.path(...paths));
      },
      async file (path, content = `File content ${ path }`) {
         if (Array.isArray(path)) {
            await context.dir(path[0]);
         }

         const pathArray = Array.isArray(path) ? path : [path];
         return await io.writeFile(context.path(...pathArray), content);
      },
      async files (...paths) {
         for (const path of paths) {
            await context.file(path);
         }
      },
      get root () {
         return root;
      },
      get rootResolvedPath () {
         return realpathSync(root);
      },
   };

   return context;
}

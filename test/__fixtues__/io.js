const {existsSync, mkdir, mkdtemp, readFile, statSync, writeFile} = require('fs');

module.exports.io = {
   isdir (path) {
      try {
         return statSync(path).isDirectory();
      }
      catch (e) {
         return false;
      }
   },
   mkdir (path) {
      return new Promise((done, fail) => {
         if (existsSync(path)) {
            return done(path);
         }

         mkdir(path, (err) => err ? fail(err) : done(path));
      });
   },
   mkdtemp () {
      return new Promise((done, fail) => {
         mkdtemp((process.env.TMPDIR || '/tmp/') + 'properties-reader-test-', (err, path) => {
            err ? fail(err) : done(path);
         });
      });
   },
   readFile (path, encoding = 'utf-8') {
      return new Promise((done, fail) => {
         readFile(path, encoding, (err, data) => {
            err ? fail(err) : done(data);
         })
      });
   },
   writeFile (path, content, encoding = 'utf-8') {
      return new Promise((done, fail) => {
         writeFile(path, content, encoding, (err) => {
            err ? fail(err) : done(path);
         })
      });
   },
};

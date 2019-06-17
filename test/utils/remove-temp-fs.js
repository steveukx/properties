
const rm = require('rimraf').sync;

module.exports = function removeTempFs (container) {
   container.splice(0, container.length).forEach(file => {
      rm(file);
   });

};

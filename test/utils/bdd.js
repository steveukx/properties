const propertiesReader = require('../../src/PropertiesReader.js');
const tempFile = require('./temporary-file');

module.exports.givenFilePropertiesReader = function givenFilePropertiesReader (content, options) {
   return propertiesReader(tempFile(content), options);
};

const propertiesReader = require('../../src/PropertiesReader.js');
const tempFile = require('./temporary-file');

module.exports.givenFilePropertiesReader = function givenFilePropertiesReader (content) {
   return propertiesReader(tempFile(content));
};

const propertiesReaderFactory = require('../../src/properties-reader-factory');
const tempFile = require('./temporary-file');

module.exports.givenFilePropertiesReader = function givenFilePropertiesReader (content, appender) {
   return propertiesReaderFactory(tempFile(content), undefined, appender);
};

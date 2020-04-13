
const PropertiesReader = require('./properties-reader');

module.exports = function propertiesReaderFactory (sourceFile, encoding, appender) {

   return new PropertiesReader(sourceFile, encoding, appender);

};


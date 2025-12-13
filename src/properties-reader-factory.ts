
import PropertiesReader = require('./properties-reader');

function propertiesReaderFactory (sourceFile?: string | null, encoding?: BufferEncoding, options?: any) {
   return new PropertiesReader(sourceFile, encoding, options);
}

export = propertiesReaderFactory;

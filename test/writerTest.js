
var Assertions = require('unit-test').Assertions;
var Sinon = require('unit-test').Sinon;
var TestCase = require('unit-test').TestCase;
var FileSystem = require('fs');
var propertiesReader = require('../src/PropertiesReader.js');
var properties;

function tempFile (content) {
   tempFile.nextName = (tempFile.nextName || 0) + 1;
   tempFile.files.push(__dirname + '/temp_file_' + tempFile.nextName + '.properties');
   FileSystem.writeFileSync(tempFile.files[tempFile.files.length - 1], content, 'utf-8');
}

function givenFilePropertiesReader (content) {
   tempFile(content);
   properties = propertiesReader(tempFile.files[tempFile.files.length - 1]);
   return properties;
}

module.exports = new TestCase("Writer", {

   setUp: function () {
      tempFile.files = tempFile.files || [];
      tempFile.dirs = tempFile.dirs || [];
   },

   tearDown: function () {
      while (tempFile.files && tempFile.files.length) {
         var filePath = tempFile.files.pop();
         try {
            FileSystem.unlink(filePath);
         }
         catch (e) {
         }
      }
      while (tempFile.dirs && tempFile.dirs.length) {
         var dirPath = tempFile.dirs.pop();
         try {
            FileSystem.rmdirSync(dirPath);
         }
         catch (e) {
         }
      }
   },

   'test Able to stringify properties': function () {
      var inputContent = 'property=Value';
      givenFilePropertiesReader(inputContent);
      var propertiesStringsArray = properties._stringifyProperties();
      Assertions.assertEquals(1, propertiesStringsArray.length, 'Output file has 1 line');
      Assertions.assertEquals(inputContent, propertiesStringsArray[0], 'Input and output content are the same.');
   },

   'test Able to stringify properties with section': function () {
     var inputContent = '[main]\nproperty=Value';
     givenFilePropertiesReader(inputContent);
     var propertiesStringsArray = properties._stringifyProperties();
     Assertions.assertEquals(2, propertiesStringsArray.length, 'Output file has 2 lines');
     Assertions.assertEquals(inputContent, propertiesStringsArray.join('\n'), 'Input and output content are the same.');
   },

   'test Able to stringify properties with the few sections': function () {
     var inputContent = 'property1=Value1\n[main]\nproperty2=Value2\n[second]\nproperty3=Value3\n[main]\nproperty4=Value4';
     givenFilePropertiesReader(inputContent);
     var propertiesStringsArray = properties._stringifyProperties();
     Assertions.assertEquals(7, propertiesStringsArray.length, 'Output file has 7 lines');
     Assertions.assertEquals(inputContent, propertiesStringsArray.join('\n'), 'Input and output content are the same.');
   },

   'test Able to stringify properties after set': function () {
     var inputContent = 'property=Value';
     givenFilePropertiesReader(inputContent);
     properties.set('property', 'xxx');
     var propertiesStringsArray = properties._stringifyProperties();
     Assertions.assertEquals('property=xxx', propertiesStringsArray.join('\n'), 'Output content inludes changes.');
   },

   'test Able to stringify properties after set with sections': function () {
     var inputContent = '[main]\nproperty=Value';
     givenFilePropertiesReader(inputContent);
     properties.set('main.property', 'xxx');
     var propertiesStringsArray = properties._stringifyProperties();
     Assertions.assertEquals('[main]\nproperty=xxx', propertiesStringsArray.join('\n'), 'Output content inludes changes.');
   },

   'test Able to stringify properties after set with sections and dots': function () {
     var inputContent = '[main]\nproperty.one=Value';
     givenFilePropertiesReader(inputContent);
     properties.set('main.property.one', 'xxx');
     var propertiesStringsArray = properties._stringifyProperties();
     Assertions.assertEquals('[main]\nproperty.one=xxx', propertiesStringsArray.join('\n'), 'Output content inludes changes with key with dot.');
   }

});

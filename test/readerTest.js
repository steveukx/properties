
var Assertions = require('unit-test').Assertions,
    Sinon = require('unit-test').Sinon,
    TestCase = require('unit-test').TestCase,
    FileSystem = require('fs'),
    propertiesReader = require('../src/PropertiesReader.js'),
    properties;

function tempFile(content) {
   tempFile.nextName = (tempFile.nextName || 0) + 1;
   tempFile.files.push(__dirname + '/temp_file_' + tempFile.nextName + '.properties');
   FileSystem.writeFileSync(tempFile.files[tempFile.files.length - 1], content, 'utf-8');
}

tempFile.pushDir = function (path) {
   tempFile.dirs.push(path);
   return path;
};

function givenFilePropertiesReader(content) {
   tempFile(content);
   properties = propertiesReader(tempFile.files[tempFile.files.length - 1]);
   return properties;
}

module.exports = new TestCase("Reader", {

   setUp: function() {
      tempFile.files = tempFile.files || [];
      tempFile.dirs = tempFile.dirs || [];
   },

   tearDown: function() {
      while(tempFile.files && tempFile.files.length) {
         var filePath = tempFile.files.pop();
         try {
            FileSystem.unlink(filePath);
         }
         catch(e) {}
      }
      while(tempFile.dirs && tempFile.dirs.length) {
         var dirPath = tempFile.dirs.pop();
         try {
            FileSystem.rmdirSync(dirPath);
         }
         catch(e) {}
      }
   },

   'test Able to read from a file': function() {
      givenFilePropertiesReader('some.property=Value');
      Assertions.assertEquals('Value', properties.get('some.property'), 'Values are read into the properties object');
   },

   'test Attempts type coercion': function() {
      givenFilePropertiesReader(
            'a = 123\n' +
            'b = true\n' +
            'c = false\n' +
            'd = 0.1');
      Assertions.assertEquals(true, properties.get('b'), 'creates boolean true');
      Assertions.assertEquals(false, properties.get('c'), 'creates boolean false');
      Assertions.assertEquals(123, properties.get('a'), 'creates integer');
      Assertions.assertEquals(0.1, properties.get('d'), 'creates float');
   },

   'test Allows access to non-parsed values': function() {
      givenFilePropertiesReader(
            'a = 123\n' +
            'b = true\n' +
            'c = false\n' +
            'd = 0.1');
      Assertions.assertEquals('true', properties.getRaw('b'), 'creates boolean true');
      Assertions.assertEquals('false', properties.getRaw('c'), 'creates boolean false');
      Assertions.assertEquals('123', properties.getRaw('a'), 'creates integer');
      Assertions.assertEquals('0.1', properties.getRaw('d'), 'creates float');
   },

   'test Properties are trimmed when parsed': function() {
      givenFilePropertiesReader('some.property =Value   \nfoo.bar = A Value');

      Assertions.assertEquals(properties.get('some.property'), 'Value', 'Values are read into the properties object');
      Assertions.assertEquals(properties.get('foo.bar'), 'A Value', 'Values are trimmed as they are read into the properties object');
   },

   'test Blank lines are ignored': function() {
      givenFilePropertiesReader('\n\nsome.property=Value\n\nfoo.bar = A Value');

      Assertions.assertEquals(properties.length, 2, 'Blank lines are not stored as properties');
   },

   'test Properties can be read back via their dot notation names': function() {
      givenFilePropertiesReader('\n\nsome.property=Value\n\nfoo.bar = A Value');

      Assertions.assertEquals(properties.path().some.property, 'Value', 'Read back along dot notation paths some.property');
      Assertions.assertEquals(properties.path().foo.bar, 'A Value', 'Read back along dot notation paths foo.bar');
   },

   'test Sets properties into an app': function () {
      var app = {set: Sinon.spy()};
      var properties = givenFilePropertiesReader('\n\nsome.property=Value\n\nfoo.bar = A Value').bindToExpress(app);

      Assertions.assert(app.set.withArgs('properties', properties).calledOnce, 'The complete properties object should be set as "properties"');
      Assertions.assert(app.set.withArgs('some.property', 'Value').calledOnce, 'Sets all properties');
      Assertions.assert(app.set.withArgs('foo.bar', 'A Value').calledOnce, 'Sets all properties');
   }
});

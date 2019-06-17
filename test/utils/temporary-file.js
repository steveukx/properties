
const FileSystem = require('fs');
const removeTempFs = require('./remove-temp-fs');

module.exports = tempFile;

tempFile.nextName = 0;

tempFile.files = [];

tempFile.dirs = [];

tempFile.tearDown = function () {
   removeTempFs(tempFile.files);
   removeTempFs(tempFile.dirs);
};

tempFile.pushDir = function (path) {
   tempFile.dirs.push(path);
   return path;
};


function tempFile (content) {
   const filePath = `${ __dirname }/temp_file_${ tempFile.nextName++ }.properties`;

   tempFile.files.push(filePath);
   FileSystem.writeFileSync(filePath, content, 'utf-8');

   return filePath;
}

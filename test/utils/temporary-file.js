
const FileSystem = require('fs');
const {exists} = require('@kwsites/file-exists');
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

/**
 * Add a single-file path to be monitored for removal by the `tempFile`. Note that monitored files
 * must be removed by including the `tempfile.tearDown()` call in the test `afterEach`
 */
tempFile.pushFile = function (filePath) {
    if (!filePath) {
        filePath = `${ __dirname }/temp_file_${ tempFile.nextName++ }.properties`;
    }

    tempFile.files.push(filePath);
    return filePath;
};

/**
 * Reads a single-file into an array, excluding any blank lines. Requires that the file is
 * already monitored for removal by the `tempFile`.
 */
tempFile.readFile = function (filePath) {
    if (!tempFile.files.includes(filePath) || ! exists(filePath)) {
        return [];
    }

    return FileSystem.readFileSync(filePath, 'utf-8')
        .split('\n')
        .filter(line => !!line.trim());
};

function tempFile (content) {
   const filePath = tempFile.pushFile();

   FileSystem.writeFileSync(filePath, content, 'utf-8');

   return filePath;
}

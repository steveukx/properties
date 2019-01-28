(function() {

    "use strict";

    var fs = require('fs');

    /**
     *
     * @param {String} sourceFile
     * @param {String} encoding
     * @constructor
     * @name {PropertiesReader}
     */
    function PropertiesReader(sourceFile, encoding) {
        this._properties = {};
        this._propertiesExpanded = {};
        this.append(sourceFile, encoding);
    }

    /**
     * @type {String} The name of a section that should be prefixed on an property as it is added
     * @ignore
     */
    PropertiesReader.prototype._section = '';

    /**
     * @type {String} The output to be written when updating properties
     * @ignore
     */
    PropertiesReader.prototype._output = '';

    /**
     * @type {Array} The keys already updated in the output
     * @ignore
     */
    PropertiesReader.prototype._updatedKeys = [];

    /**
     * Gets the number of properties that have been read into this PropertiesReader.
     *
     * @name PropertiesReader#length
     * @type {Number}
     */
    Object.defineProperty(PropertiesReader.prototype, 'length', {
        configurable: false,
        enumerable: false,
        get: function() {
            return Object.keys(this._properties).length;
        },
        set: function() {
            throw new Error("Cannot set length of PropertiesReader properties");
        }
    });

    /**
     * Append a file to the properties into the PropertiesReader
     * @param {string} sourceFile
     * @param {String} encoding
     * @return {PropertiesReader} this instance
     */
    PropertiesReader.prototype.append = function (sourceFile, encoding) {
        if (sourceFile) {
            this.read(fs.readFileSync(sourceFile, encoding ? encoding : 'utf-8'));
        }
        return this;
    };

    /**
     * Reads any string input into the PropertiesReader
     *
     * @param {String} input
     * @return {PropertiesReader} this instance
     */
    PropertiesReader.prototype.read = function(input) {
        delete this._section;
        ('' + input).split('\n').forEach(this._readLine, this);
        return this;
    };

    /**
     * Used as a processor for the array of input lines when reading from a source file
     * @param {String} propertyString
     */
    PropertiesReader.prototype._readLine = function(propertyString) {
        if (!!(propertyString = propertyString.trim())) {
            var section = /^\[([^=]+)\]$/.exec(propertyString);
            var property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(propertyString);

            if (section) {
                this._section = section[1];
            }
            else if (property) {
                section = this._section ? this._section + '.' : '';
                this.set(section + property[1].trim(), property[3].trim());
            }
        }
    };

    /**
     * Updates the sourceFile with the given properties string
     * @param {string} destFile
     * @param {String} encoding
     * @return {PropertiesReader} this instance
     */
    PropertiesReader.prototype.update = function(destFile, encoding) {
        var input = fs.readFileSync(destFile, encoding ? encoding : 'utf-8');
        this._output = '';
        ('' + input).split('\n').forEach(this._updateLine, this);
        this.each((key, value) => { 
            if (!this._updatedKeys.includes(key)) {
                this._output = this._output + key + '=' + value + '\n';
            }
        });
        // Se elimina el �ltimo retorno de carro
        fs.writeFileSync(destFile, this._output.substring(0, this._output.length - 1), encoding);
        return this;
    };

    /**
     * Used as a processor for the array of input lines when updating to a dest file
     * @param {String} propertyString
     */
    PropertiesReader.prototype._updateLine = function(propertyString) {
        var updated = false;
        if (!!(propertyString = propertyString.trim())) {
            var section = /^\[([^=]+)\]$/.exec(propertyString);
            var property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(propertyString);
            if (section) {
                this._section = section[1];
            } else if (property) {
                section = this._section ? this._section + '.' : '';
                var key = section + property[1].trim();
                var newValue = this.get(key);
                if (newValue != null && newValue != undefined) {
                    updated = true;
                    this._output = this._output + key + "=" + newValue + '\n';
                    this._updatedKeys.push(key);
                }
            }
        }
        if (!updated) {
            this._output += propertyString + '\n';
        }
    };

    /**
     * Calls the supplied function for each property
     *
     * @param {Function} fn
     * @param {Object} scope
     * @return {PropertiesReader}
     */
    PropertiesReader.prototype.each = function(fn, scope) {
        for (var key in this._properties) {
            if (this._properties.hasOwnProperty(key)) {
                fn.call(scope || this, key, this._properties[key]);
            }
        }
        return this;
    };

    /**
     * Given the supplied raw value, returns the parsed value
     */
    PropertiesReader.prototype._parsed = function(value) {
        var parsedValue = value;
        if (value !== null && !isNaN(value)) {
            parsedValue = +value;
        }
        else if (value === 'true' || value === 'false') {
            parsedValue = (value === 'true');
        }
        else if (typeof value === "string") {
            var replacements = {'\\n': '\n', '\\r': '\r', '\\t': '\t'};
            parsedValue = value.replace(/\\[nrt]/g, function (key) {
                return replacements[key];
            });
        }

        return parsedValue;
    };

    /**
     * Gets a single property value based on the full string key. When the property is not found in the
     * PropertiesReader, the return value will be null.
     *
     * @param {String} key
     * @return {*}
     */
    PropertiesReader.prototype.get = function(key) {
        return this._parsed(this.getRaw(key));
    };

    /**
     * Gets the string representation as it was read from the properties file without coercions for type recognition.
     *
     * @param {string} key
     * @returns {string}
     */
    PropertiesReader.prototype.getRaw = function(key) {
        return this._properties.hasOwnProperty(key) ? this._properties[key] : null;
    };

    /**
     * Sets the supplied key in the properties store with the supplied value, the value can be any string representation
     * that would be valid in a properties file (eg: true and false or numbers are converted to their real values).
     *
     * @param {String} key
     * @param {String} value
     * @return {PropertiesReader}
     */
    PropertiesReader.prototype.set = function(key, value) {
        var parsedValue = ('' + value).trim();

        this._properties[key] = parsedValue;

        var expanded = key.split('.');
        var source = this._propertiesExpanded;
        while (expanded.length > 1) {
            var step = expanded.shift();
            if (expanded.length >= 1 && typeof source[step] === 'string') {
                source[step] = {'':source[step]};
            }
            source = (source[step] = source[step] || {});
        }
        if (typeof parsedValue === 'string' && typeof  source[expanded[0]] === 'object') {
            source[expanded[0]][''] = parsedValue;
        }
        else {
            source[expanded[0]] = parsedValue;
        }

        return this;
    };

    /**
     * Gets the object that represents the exploded properties.
     *
     * Note that this object is currently mutable without the option to persist or interrogate changes.
     *
     * @return {*}
     */
    PropertiesReader.prototype.path = function() {
        return this._propertiesExpanded;
    };

    /**
     * Gets the object that represents all properties.
     *
     * @returns {Object}
     */
    PropertiesReader.prototype.getAllProperties = function() {
        var properties = {};
        this.each(function (key, value) {
            properties[key] = value;
        });
        return properties;
    };

    /**
     * Creates and returns a new PropertiesReader based on the values in this instance.
     * @return {PropertiesReader}
     */
    PropertiesReader.prototype.clone = function() {
        var propertiesReader = new PropertiesReader(null);
        this.each(propertiesReader.set, propertiesReader);

        return propertiesReader;
    };

    /**
     * Return a json from a root properties
     * @param root
     * @returns {{}}
     */
    PropertiesReader.prototype.getByRoot = function(root){
        var keys = Object.keys(this._properties);
        var outObj = {};

        for (var i = 0, prefixLength = String(root).length; i < keys.length; i++) {
            var key = keys[i];

            if (key.indexOf(root) === 0 && key.charAt(prefixLength) === '.') {
                outObj[key.substr(prefixLength + 1)] = this.get(key);
            }
        }

        return outObj;
    };

    /**
     * Binds the current properties object and all values in it to the supplied express app.
     *
     * @param {Object} app The express app (or any object that has a `set` function)
     * @param {String} [basePath] The absolute prefix to use for all path properties - defaults to the cwd.
     * @param {Boolean} [makePaths=false] When true will attempt to create the directory structure to any path property
     */
    PropertiesReader.prototype.bindToExpress = function(app, basePath, makePaths) {
        var Path = require('path');

        if (!/\/$/.test(basePath = basePath || process.cwd())) {
            basePath += '/';
        }

        this.each(function (key, value) {
            if (value && /\.(path|dir)$/.test(key)) {
                value = Path.join(basePath, Path.relative(basePath, value));
                this.set(key, value);

                try {
                    var directoryPath = /dir$/.test(key) ? value : Path.dirname(value);
                    if (makePaths) {
                        require('mkdirp').sync(directoryPath);
                    }
                    else if (!fs.statSync(directoryPath).isDirectory()) {
                        throw new Error("Path is not a directory that already exists");
                    }
                }
                catch (e) {
                    throw new Error("Unable to create directory " + value);
                }
            }

            app.set(key, this.get(key));

            if(/^browser\./.test(key)) {
                app.locals[key.substr(8)] = this.get(key);
            }
        }, this);

        app.set('properties', this);

        return this;
    };

    PropertiesReader.builder = function(sourceFile, encoding) {
        return new PropertiesReader(sourceFile, encoding);
    };

    module.exports = PropertiesReader.builder;
}());

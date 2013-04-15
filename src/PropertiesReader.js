(function() {

   "use strict";

   var fs = require('fs');

   /**
    *
    * @param {String} sourceFile
    * @constructor
    * @name {PropertiesReader}
    */
   function PropertiesReader(sourceFile) {
      this._properties = {};
      this._propertiesExpanded = {};
      sourceFile && this.read(fs.readFileSync(sourceFile, 'utf-8'));
   }

   /**
    * Gets the number of properties that have been read into this PropertiesReader.
    *
    * @name PropertiesReader#length
    * @type {Number}
    */
   Object.defineProperty(PropertiesReader.prototype, 'length', {
      configurable: false,
      get: function() {
         return Object.keys(this._properties).length;
      },
      set: function() {
         throw new Error("Cannot set length of PropertiesReader properties");
      }
   });

   /**
    * Reads any string input into the PropertiesReader
    *
    * @param {String} input
    * @return {PropertiesReader} this instance
    */
   PropertiesReader.prototype.read = function(input) {
      ('' + input).split('\n').forEach(this._addProperty, this);
      return this;
   };

   /**
    * Calls the supplied function for each property
    *
    * @param {Function} fn
    * @param {Object} scope
    * @return {PropertiesReader}
    */
   PropertiesReader.prototype.each = function(fn, scope) {
      for(var key in this._properties) {
         fn.call(scope, key, this._properties[key]);
      }
      return this;
   };

   PropertiesReader.prototype.get = function(key) {
      return this._properties.hasOwnProperty(key) ? this._properties[key] : null;
   };

   PropertiesReader.prototype.set = function(key, value) {
      this._addProperty(key + '=' + value);
      return this;
   };

   PropertiesReader.prototype.path = function() {
      return this._propertiesExpanded;
   };

   PropertiesReader.prototype._addProperty = function(propertyString) {
      if(!!propertyString.trim()) {
         var property = propertyString.split('=', 2);
         var key = property[0].trim();
         var value = property[1];

         if(!isNaN(value)) {
            value = +value;
         }
         else if(value == 'true' || value == 'false') {
            value = (value == 'true');
         }
         else {
            value = ('' + value).trim();
         }

         this._properties[key] = value;

         var expanded = key.split('.');
         var source = this._propertiesExpanded;
         while(expanded.length > 1) {
            var step = expanded.shift();
            source = (source[step] = source[step] || {});
         }
         source[expanded[0]] = value;
      }
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


   PropertiesReader.builder = function(sourceFile) {
      return new PropertiesReader(sourceFile);
   };

   module.exports = PropertiesReader.builder;
}());

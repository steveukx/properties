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
      sourceFile && fs.readFileSync(sourceFile, 'utf-8').split('\n').forEach(this._addProperty, this);
   }

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
      return  this._properties[key] !== undefined ? this._properties[key] : null;
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
         var value = property[1];
         if(!isNaN(value)) {
            value = +value;
         }
         else if(value == 'true' || value == 'false') {
            value = (value == 'true');
         }
         this._properties[property[0]] = value;

         var expanded = property[0].split('.');
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
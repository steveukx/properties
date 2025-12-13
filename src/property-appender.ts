export type PropertyRecord = Record<string, string>;

export interface AppenderOptions {
   allowDuplicateSections?: boolean;
}

const defaultOptions: AppenderOptions = {
   allowDuplicateSections: false,
};

type PropertyAppender = (properties: PropertyRecord, key: string, value: string) => PropertyRecord;

function simplePropertyAppender (properties: PropertyRecord, key: string, value: string): PropertyRecord {
   properties[key] = value;
   return properties;
}

function sectionCollapsePropertyAppender (properties: PropertyRecord, key: string, value: string): PropertyRecord {
   const output: PropertyRecord = {};
   const section = sectionFromPropertyName(key);
   const existingKeys = Object.keys(properties);

   if (!section || !existingKeys.length) {
      output[key] = value;
      return Object.assign(properties, output);
   }

   const BEFORE = 1, DURING = 2, AFTER = 4;
   let processing = BEFORE;

   existingKeys.forEach((processingKey) => {
      const during = processing !== AFTER && processingKey.indexOf(section + '.') === 0;

      if (key === processingKey) {
         properties[processingKey] = value;
         processing = AFTER;
      }
      else if (processing === BEFORE && during) {
         processing = DURING;
      }
      else if (processing === DURING && !during) {
         output[key] = value;
         processing = AFTER;
      }

      output[processingKey] = properties[processingKey];
   });

   if (processing !== AFTER) {
      output[key] = value;
   }

   return output;
}

function sectionFromPropertyName (name: string): string {
   const index = String(name).indexOf('.');
   return index > 0 && name.substring(0, index) || '';
}

/**
 * Builder method used to create a property appending function configured to the user
 * requirements.
 */
function propertyAppender (userOptions?: AppenderOptions): PropertyAppender {
   const options = Object.assign({}, defaultOptions, userOptions || {});
   return options.allowDuplicateSections ? simplePropertyAppender : sectionCollapsePropertyAppender;
}

export { defaultOptions, propertyAppender };

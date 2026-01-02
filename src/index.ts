import { createPropertiesReader } from './reader';

export default createPropertiesReader;

export const propertiesReader = createPropertiesReader;

export { bindToExpress, expressBasePath } from './bind-to-express';

export const logger = (name) => {
   return (...args) => console.log(`${name}:`, ...args);
};

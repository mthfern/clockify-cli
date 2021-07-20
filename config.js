/* eslint-disable no-console */
const args = require('minimist')(process.argv.slice(2));
const { parseConfig } = require('./control/parseFunctions');
const config = require('./control/config');

console.log(`application started`);
const configParams = parseConfig(args);

(async () => {
  try {
    const result = await config(configParams);
    console.log(result);
    console.log(`application ended successfully`);
  } catch (error) {
    console.error(`${error.stack}`);
  }
})();

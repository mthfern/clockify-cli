/* eslint-disable no-console */
require('dotenv').config({ path: './config.env' });
const args = require('minimist')(process.argv.slice(2));
const { parseTimeEntries } = require('./control/parseFunctions');
const addTime = require('./control/addTime');

console.log(`application started`);

// get configuration (should run config.js before)
const env = {
  apikey: process.env.CLOCKIFY_X_API_KEY,
  workspaceId: process.env.CLOCKIFY_WORKSPACEID,
  projectId: process.env.CLOCKIFY_PROJECTID,
  taskId: process.env.CLOCKIFY_TASKID,
};

// parse params into time entries
const timeEntries = parseTimeEntries(args);

(async () => {
  try {
    await addTime(timeEntries, env);
    console.log(`application ended successfully`);
  } catch (error) {
    console.error(`${error.stack}`);
  }
})();

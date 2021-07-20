/* eslint-disable no-console */
const cliParams = require('minimist')(process.argv.slice(2));
const configResource = require('./control/resource');
const addTimeEntries = require('./control/addTimeEntries');
const Message = require('./model/Message');

async function runApplication(callback, ...args) {
  try {
    const result = await callback(...args);
    console.log(result);
  } catch (error) {
    Error(`${error.message}`);
  }
}

function getEnvConfig() {
  return {
    apikey: process.env.CLOCKIFY_X_API_KEY,
    workspaceId: process.env.CLOCKIFY_WORKSPACEID,
    projectId: process.env.CLOCKIFY_PROJECTID,
    taskId: process.env.CLOCKIFY_TASKID,
  };
}

console.log(`application started`);

// get execution type
const { type } = cliParams;

switch (type) {
  case 'config':
    runApplication(configResource, cliParams);
    break;
  case 'add':
    runApplication(addTimeEntries, cliParams, getEnvConfig());
    break;
  default:
    Error(new Message(6).toString());
    break;
}

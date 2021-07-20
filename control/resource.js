/* eslint-disable no-console */

/**
 * Get and configure resource data
 *
 */

const fs = require('fs');
const Message = require('../model/Message');
const { reqDefaults, Request } = require('../model/Request');
const { parseResourceParams } = require('../model/ParseFunctions');

// Get workspace id from resource
async function getWorkspaceId(workspaceName) {
  try {
    const wkspReq = new Request('getWorkspaces');
    const wkspData = await wkspReq.execute();
    const { id: workspaceId } = wkspData.find(
      (el) => el.name === workspaceName
    ) || { id: '' };

    if (!workspaceId) {
      throw new Error(
        new Message(5)
          .toString()
          .replace('{OBJECT}', 'workspace')
          .replace('{VALUE}', workspaceName)
      );
    }
    console.log(`workspace id: ${workspaceId}`);
    return workspaceId;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get project id from resource
async function getProjectId(workspaceId, projectName) {
  try {
    const projectReq = new Request('getProjects', [
      { name: '{workspaceId}', value: workspaceId },
    ]);
    const projectData = await projectReq.execute({
      params: { name: projectName },
    });
    const { id: projectId } = projectData[0] || { id: '' };

    if (!projectId) {
      throw new Error(
        new Message(5)
          .toString()
          .replace('{OBJECT}', 'project')
          .replace('{VALUE}', projectName)
      );
    }

    console.log(`project id: ${projectId}`);
    return projectId;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get task id from resource
async function getTaskId(workspaceId, projectId, taskName) {
  try {
    const taskReq = new Request('getTasks', [
      { name: '{workspaceId}', value: workspaceId },
      { name: '{projectId}', value: projectId },
    ]);
    const taskData = await taskReq.execute({
      params: { name: taskName },
    });
    const { id: taskId } = taskData[0] || { id: '' };

    if (!taskId) {
      throw new Error(
        new Message(5)
          .toString()
          .replace('{OBJECT}', 'task')
          .replace('{VALUE}', taskName)
      );
    }

    console.log(`task id: ${taskId}`);
    return taskId;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Write configuration data to config.env file
function saveResourceData(envConfig) {
  const { apikey, workspaceId, projectId, taskId } = envConfig;

  const envWorkspaceId = `CLOCKIFY_WORKSPACEID=${workspaceId}`;
  const envProjectId = `CLOCKIFY_PROJECTID=${projectId}`;
  const envTaskId = `CLOCKIFY_TASKID=${taskId}`;
  const envApiKey = `CLOCKIFY_X_API_KEY=${apikey}`;

  const envData = `${envWorkspaceId}\n${envProjectId}\n${envTaskId}\n${envApiKey}`;

  fs.writeFileSync(`${__dirname}/../config.env`, envData);

  console.log('Resource data saved');
}

// Get workspace, project and task ids using user api key
async function getResourceData(configParams) {
  const { apikey, workspaceName, projectName, taskName } = configParams;

  // set header parameter 'X-Api-Key' once for all requests
  reqDefaults.headers['X-Api-Key'] = apikey;

  let workspaceId;
  let projectId;
  let taskId;

  try {
    workspaceId = await getWorkspaceId(workspaceName);
    projectId = await getProjectId(workspaceId, projectName);
    taskId = await getTaskId(workspaceId, projectId, taskName);
  } catch (error) {
    const newError = new Error(
      `Error getting resource data...\n${error.message}`
    );
    newError.stack = error.stack;
    throw newError;
  }
  // Return resource data as config object
  return { apikey, workspaceId, projectId, taskId };
}

/**
 * Resource configuration process.
 * Saves clockify's resource data (workspace, project, task and apikey) locally into a config.env file.
 * Each subsequent time entry added (using '--type add') will use the local resource data as parameters.
 * If the user wishes to add time entries to another resource, it must run this configuration process again providing the new resource parameters.
 *
 */
module.exports = async function configResource(cliParams) {
  const resourceParams = parseResourceParams(cliParams);

  try {
    // get data from clockify
    const resourceData = await getResourceData(resourceParams);

    // write data to local config.env file
    saveResourceData(resourceData);

    return 'Resource data configuration complete!';
  } catch (error) {
    const newError = new Error(
      `Error configuring resource data...\n${error.message}`
    );
    newError.stack = error.stack;
    throw newError;
  }
};

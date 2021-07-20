/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { parseTimeEntryParams } = require('../model/ParseFunctions');
const { requestDefaults, Request } = require('../model/Request');

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function logResult(result) {
  for (const item of result) {
    const start = new Date(item.timeInterval.start).toLocaleString();
    const end = new Date(item.timeInterval.end).toLocaleString();

    if (item.status === 'success') {
      console.log(`CREATED: ${start} => ${end}`);
    } else {
      console.log(`FAILED: ${start} => ${end} [${item.error.toString()}]`);
    }
  }
}

async function sendRequest(workspaceId, config) {
  try {
    const request = new Request('addTimeEntry', [
      { name: '{workspaceId}', value: workspaceId },
    ]);

    const result = await request.execute(config);

    return { status: 'success', timeInterval: result.timeInterval, result };
  } catch (error) {
    return {
      status: 'failed',
      timeInterval: { start: config.data.start, end: config.data.end },
      error,
    };
  }
}

// Post time entries to clockify
async function postTimeEntries(timeData, env) {
  // Get clockify local configuration
  const { apikey, workspaceId, projectId, taskId } = env;
  const { description, timeEntries } = timeData;

  requestDefaults.headers['X-Api-Key'] = apikey;

  const baseEntry = {
    description,
    projectId,
    taskId,
  };

  const results = [];
  let result;

  for (const entry of timeEntries) {
    const { startDttm, breakStartDttm, breakEndDttm, endDttm } = entry;

    try {
      await sleep(200);
      if (breakStartDttm && breakEndDttm) {
        result = await Promise.all([
          sendRequest(workspaceId, {
            data: {
              ...baseEntry,
              start: startDttm,
              end: breakStartDttm,
            },
          }),
          sendRequest(workspaceId, {
            data: {
              ...baseEntry,
              start: breakEndDttm,
              end: endDttm,
            },
          }),
        ]);
      } else {
        result = [
          await sendRequest(workspaceId, {
            data: {
              ...baseEntry,
              start: startDttm,
              end: endDttm,
            },
          }),
        ];
      }
    } catch (error) {
      const newError = new Error(
        `Error posting to resource...\n${error.message}`
      );
      newError.stack = error.stack;
      throw newError;
    }

    logResult(result);
    results.push(result);
  }

  return results;
}

// Add time entries process
module.exports = async function addTimeEntries(cliParams, configParams) {
  const timeEntries = parseTimeEntryParams(cliParams);

  try {
    // post time entries to clockify
    await postTimeEntries(timeEntries, configParams);

    return `time entries added!`;
  } catch (error) {
    const newError = new Error(
      `Error processing time entries...\n${error.message}`
    );
    newError.stack = error.stack;
    throw newError;
  }
};

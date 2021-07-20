/**
 * Validate and parse execution parameters
 *
 */

const { eachDayOfInterval, isWeekend } = require('date-fns');
const Message = require('./Message');

// format expected: YYYY-MM-DD or YYYY/MM/DD
function isValidDate(date) {
  return /^[\d]{4}[-/]{1}[\d]{2}[-/]{1}[\d]{2}$/.test(date);
}

// format expected: HHMI-HHMI[-HHMI-HHMI]
function isValidHours(hours) {
  return /^[\d-]+$/.test(hours);
}

// time becomes number after spliting 'hours' param, so 'stringify' it
function parseTimeString(time) {
  time = `0000${time}`;
  return time.substring(time.length - 4);
}

// get hours portion from time string
function parseHours(time) {
  return parseTimeString(time).substring(0, 2) * 1;
}

// get minutes portion from time string
function parseMinutes(time) {
  return parseTimeString(time).substring(2, 4) * 1;
}

// Date object expects month to be in the range [0-11]
function parseMonth(month) {
  return month * 1 - 1;
}

// Date object will be set several times
function setDateHours(date, time) {
  date.setHours(parseHours(time), parseMinutes(time));
  return date;
}

/**
 * Parse date and hours params into resource-ready time entries.
 * Return an array of objects, one for each non weekend date between two dates.
 * Each object contains 4 date ISO string properties (start, break, break end, end) that will be used to add time entries on clockify.
 * Params:
 *  dateFrom: <String> (YYYY-MM-DD or YYYY/MM/DD)
 *  dateTo: <String> (YYYY-MM-DD or YYYY/MM/DD)
 *  hours: <String> (HHMI-HHMI[HHMI-HHMI])
 *
 */

function timeEntriesInterval(dateFrom, dateTo, hours) {
  // create the base date objects
  const [y1, m1, d1] = dateFrom.split(/[-/]/g);
  const [y2, m2, d2] = dateTo.split(/[-/]/g);
  const startDate = new Date(y1, parseMonth(m1), d1);
  const endDate = new Date(y2, parseMonth(m2), d2);

  // create array with dates (interval of non weekend dates)
  let interval = eachDayOfInterval({
    start: startDate,
    end: endDate,
  }).filter((date) => !isWeekend(date));

  // hours are separated by '-'
  const [hour1 = '', hour2 = '', hour3 = '', hour4 = ''] = String(hours).split(
    '-'
  );

  // there must be at least 2 hours (start & end) to create a time entry on clockify
  if (!(hour1 && hour2)) throw new Error(new Message(2.1).toString());

  const start = hour1;
  const end = hour4 || hour2;
  const breakStart = hour4 ? hour2 : '';
  const breakEnd = hour4 ? hour3 : '';

  // interval will be an array of objects with date ISO strings properties
  interval = interval.map(function (date) {
    return {
      start: setDateHours(date, start).toISOString(),
      end: setDateHours(date, end).toISOString(),
      breakStart: breakStart
        ? setDateHours(date, breakStart).toISOString()
        : '',
      breakEnd: breakEnd ? setDateHours(date, breakEnd).toISOString() : '',
    };
  });

  return interval;
}

exports.parseResourceParams = function (params) {
  const {
    workspace: workspaceName,
    project: projectName,
    task: taskName,
    key: apikey,
  } = params;

  // invalid sintax
  if (
    !(workspaceName && projectName && taskName && apikey) ||
    typeof (workspaceName || projectName || taskName || apikey) === 'boolean'
  ) {
    throw new Error(new Message(4).toString());
  }

  return {
    workspaceName,
    projectName,
    taskName,
    apikey,
  };
};

exports.parseTimeEntryParams = function (params) {
  const { date, hours, descr: description } = params;
  let { 'date-from': dateFrom, 'date-to': dateTo } = params;

  // Validate dates
  if (dateFrom && dateTo) {
    if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
      throw new Error(new Message(2).toString());
    }
  } else if (date) {
    dateFrom = date;
    dateTo = date;
    if (!isValidDate(dateFrom)) {
      throw new Error(new Message(2).toString());
    }
  } else {
    throw new Error(new Message(1).toString());
  }

  // Validate hours & descr
  if (!(hours || description)) throw new Error(new Message(1).toString());
  if (!isValidHours(hours)) throw new Error(new Message(2.1).toString());

  // Parse time entries
  const timeEntries = timeEntriesInterval(dateFrom, dateTo, hours);

  return {
    description,
    timeEntries,
  };
};

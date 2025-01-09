// env.CONSOLE_LOG contains a string telling the api what to log in console using numbers.
// example string: "INFO:0;WARN:6;ERROR:9" = will not log INFO, will log WARN up to level 6 and ERROR up to level 9.

import type { LogLevel, LogType, LogData } from './types';
import connectCollection from '../database/mongo';

function consoleLog(t: LogType, l: LogLevel, m: string, d: LogData) {
  const consoleLog = process.env.CONSOLE_LOG || '';
  const logLevels = consoleLog.split(';');
  const logLevel = logLevels.find((logLevel) => logLevel.includes(t));
  if (logLevel) {
    const [logType, logLevelValue] = logLevel.split(':');
    if (l <= parseInt(logLevelValue)) {
      console[logType.toLowerCase()](m);
      if (Object.keys(d).length) console.log(d);
    }
  }
}
async function mongoLog(t: LogType, l: LogLevel, m: string, d: LogData) {
  const coll = await connectCollection('logs');
  coll.insertOne({
    type: t,
    level: l,
    message: m,
    data: d,
    createdAt: new Date(),
  });
}

function info(
  level: LogLevel,
  message: string,
  data: LogData,
  logMongo = true
) {
  consoleLog('INFO', level, message, data);
  if (logMongo) mongoLog('INFO', level, message, data);
}

function warn(
  level: LogLevel,
  message: string,
  data: LogData,
  logMongo = true
) {
  consoleLog('WARN', level, message, data);
  if (logMongo) mongoLog('WARN', level, message, data);
}

function error(
  level: LogLevel,
  message: string,
  data: LogData & { error: Error | any },
  logMongo = true
) {
  if (data.error instanceof Error) {
    data = {
      ...data,
      error: {
        message: data.error.message,
        stack: data.error.stack,
      },
    };
  }
  consoleLog('ERROR', level, message, data);
  if (logMongo) mongoLog('ERROR', level, message, data);
}

export default { info, warn, error };

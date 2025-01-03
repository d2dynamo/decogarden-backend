export type LogType = 'INFO' | 'WARN' | 'ERROR';
export type LogLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type LogData = {
  userId?: string;
  [key: string]: any;
};

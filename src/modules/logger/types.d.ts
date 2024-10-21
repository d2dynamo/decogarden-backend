export type LogType = "INFO" | "WARN" | "ERROR";
export type LogLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface LogData {
  type: LogType;
  level: LogLevel;
  userId?: string;
  message: string;
  data: { [key: string]: any };
}

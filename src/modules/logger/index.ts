// env.CONSOLE_LOG contains a string telling the api what to log in console using numbers.
// example string: "INFO:-1;WARN:6;ERROR:9" = will not log INFO, will log WARN up to level 6 and ERROR up to level 9.

import type { LogLevel, LogType } from "./types";

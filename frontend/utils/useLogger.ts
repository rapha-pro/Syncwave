import { useMemo } from "react";

function getTimestamp() {
  return new Date().toLocaleTimeString();
}

function makeLogger(scope: string) {
  function format(level: string, color: string) {
    const time = getTimestamp();
    const prefix = `%c[${scope}] [${time}] [${level.toUpperCase()}]`;
    const style = `color: ${color}; font-weight: bold;`;

    return [prefix, style];
  }

  return {
    log: (...args: any[]) => console.log(...format("log", "gray"), ...args),
    info: (...args: any[]) =>
      console.info(...format("info", "dodgerblue"), ...args),
    warn: (...args: any[]) =>
      console.warn(...format("warn", "orange"), ...args),
    error: (...args: any[]) =>
      console.error(...format("error", "red"), ...args),
    success: (...args: any[]) =>
      console.log(...format("success", "green"), ...args),
  };
}

export function useLogger(scope: string) {
  return useMemo(() => makeLogger(scope), [scope]);
}

export function createLogger(scope: string) {
  return makeLogger(scope);
}

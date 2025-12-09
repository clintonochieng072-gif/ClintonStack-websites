interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private log(entry: LogEntry) {
    const logMessage = `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()}: ${
      entry.message
    }`;
    console.log(logMessage);
    if (entry.data) {
      console.log(JSON.stringify(entry.data, null, 2));
    }
  }

  info(message: string, data?: any) {
    this.log({ level: "info", message, data, timestamp: new Date() });
  }

  warn(message: string, data?: any) {
    this.log({ level: "warn", message, data, timestamp: new Date() });
  }

  error(message: string, data?: any) {
    this.log({ level: "error", message, data, timestamp: new Date() });
  }
}

export const logger = new Logger();

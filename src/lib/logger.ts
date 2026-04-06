type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

export const logger = {
  log: (level: LogLevel, message: string, context?: Record<string, any>) => {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      const color = {
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[34m',
      }[level];
      console.log(`${color}[${entry.level.toUpperCase()}]\x1b[0m ${entry.timestamp} - ${entry.message}`, context || '');
    }

    // In the future, we could send this to an external logging service (Sentry, Logtail, etc.)
  },
  info: (message: string, context?: Record<string, any>) => logger.log('info', message, context),
  warn: (message: string, context?: Record<string, any>) => logger.log('warn', message, context),
  error: (message: string, context?: Record<string, any>) => logger.log('error', message, context),
  debug: (message: string, context?: Record<string, any>) => logger.log('debug', message, context),
};


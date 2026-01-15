/**
 * Production logging utility for client-side tracking and debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isProduction: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    // In production, only log info and above. In dev, log everything
    this.logLevel = this.isProduction ? 'info' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    const logData = {
      level,
      message,
      context: context || {},
      timestamp: new Date().toISOString(),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // In production, send to console with structured format
    // In development, use more readable format
    if (this.isProduction) {
      // Production: structured JSON logging
      console.log(JSON.stringify(logData));
    } else {
      // Development: readable format
      switch (level) {
        case 'error':
          console.error(formattedMessage, error || '');
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }

    // In production, you could also send to a logging service here
    // Example: sendToLoggingService(logData);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }

  // Event tracking methods
  trackEvent(eventName: string, properties?: LogContext) {
    this.info(`Event: ${eventName}`, {
      event: eventName,
      ...properties,
    });
  }

  trackError(errorName: string, error: Error, context?: LogContext) {
    this.error(`Error: ${errorName}`, error, {
      errorName,
      ...context,
    });
  }

  // API request/response tracking
  trackApiRequest(method: string, url: string, context?: LogContext) {
    this.debug('API Request', {
      method,
      url,
      ...context,
    });
  }

  trackApiResponse(method: string, url: string, status: number, duration?: number, context?: LogContext) {
    this.info('API Response', {
      method,
      url,
      status,
      duration,
      ...context,
    });
  }

  trackApiError(method: string, url: string, error: Error, context?: LogContext) {
    this.error('API Error', error, {
      method,
      url,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;

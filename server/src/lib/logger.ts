/**
 * Enhanced production logging utility for server-side tracking and debugging
 * Extends Fastify's built-in logger with additional tracking capabilities
 */

import { FastifyInstance } from 'fastify';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

export class ServerLogger {
  private fastify: FastifyInstance | null = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  setFastifyInstance(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const logData = {
      level,
      message,
      context: context || {},
      timestamp: new Date().toISOString(),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack, // Don't log stack in production unless needed
        },
      }),
    };

    if (this.fastify) {
      // Use Fastify's logger
      switch (level) {
        case 'error':
          this.fastify.log.error(logData, message);
          break;
        case 'warn':
          this.fastify.log.warn(logData, message);
          break;
        case 'debug':
          this.fastify.log.debug(logData, message);
          break;
        default:
          this.fastify.log.info(logData, message);
      }
    } else {
      // Fallback to console if Fastify logger not available
      const formattedMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message} ${context ? JSON.stringify(context) : ''}`;
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

  // Business logic tracking
  trackBusinessEvent(eventName: string, tenantId?: string, userId?: string, context?: LogContext) {
    this.info(`Business Event: ${eventName}`, {
      event: eventName,
      tenantId,
      userId,
      ...context,
    });
  }

  // Database operation tracking
  trackDbOperation(operation: string, table: string, duration?: number, context?: LogContext) {
    this.debug('Database Operation', {
      operation,
      table,
      duration,
      ...context,
    });
  }

  // Service method tracking
  trackServiceMethod(service: string, method: string, duration?: number, context?: LogContext) {
    this.debug('Service Method', {
      service,
      method,
      duration,
      ...context,
    });
  }

  // Authentication tracking
  trackAuthEvent(event: string, tenantId?: string, context?: LogContext) {
    this.info(`Auth Event: ${event}`, {
      event,
      tenantId,
      ...context,
    });
  }

  // API request/response tracking (for external API calls)
  trackExternalApiRequest(method: string, url: string, context?: LogContext) {
    this.debug('External API Request', {
      method,
      url,
      ...context,
    });
  }

  trackExternalApiResponse(method: string, url: string, status: number, duration?: number, context?: LogContext) {
    this.info('External API Response', {
      method,
      url,
      status,
      duration,
      ...context,
    });
  }

  trackExternalApiError(method: string, url: string, error: Error, context?: LogContext) {
    this.error('External API Error', error, {
      method,
      url,
      ...context,
    });
  }
}

// Export singleton instance
export const serverLogger = new ServerLogger();
export default serverLogger;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'http';

const LOG_COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgDark: '\x1b[40m',
};

class Logger {
  private formatTime(): string {
    return new Date().toISOString();
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): string {
    const timestamp = `${LOG_COLORS.dim}[${this.formatTime()}]${LOG_COLORS.reset}`;
    let levelBadge = '';

    switch (level) {
      case 'info':
        levelBadge = `${LOG_COLORS.blue}[INFO]${LOG_COLORS.reset}`;
        break;
      case 'warn':
        levelBadge = `${LOG_COLORS.yellow}[WARN]${LOG_COLORS.reset}`;
        break;
      case 'error':
        levelBadge = `${LOG_COLORS.red}${LOG_COLORS.bright}[ERROR]${LOG_COLORS.reset}`;
        break;
      case 'http':
        levelBadge = `${LOG_COLORS.cyan}[HTTP]${LOG_COLORS.reset}`;
        break;
      case 'debug':
        levelBadge = `${LOG_COLORS.magenta}[DEBUG]${LOG_COLORS.reset}`;
        break;
    }

    const contextStr = context
      ? ` ${LOG_COLORS.dim}${JSON.stringify(context)}${LOG_COLORS.reset}`
      : '';
    return `${timestamp} ${levelBadge} ${message}${contextStr}`;
  }

  public info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage('info', message, context));
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack, ...context }
        : { rawError: error, ...context };
    console.error(this.formatMessage('error', message, errorDetails));
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  public http(
    method: string,
    url: string,
    status: number,
    durationMs: number,
    requestId?: string
  ): void {
    const methodColor =
      method === 'GET' ? LOG_COLORS.green : method === 'POST' ? LOG_COLORS.cyan : LOG_COLORS.yellow;

    const statusColor =
      status >= 500 ? LOG_COLORS.red : status >= 400 ? LOG_COLORS.yellow : LOG_COLORS.green;

    const reqIdTag = requestId ? ` ${LOG_COLORS.dim}(req: ${requestId})${LOG_COLORS.reset}` : '';
    const durationTag = `${LOG_COLORS.dim}+${durationMs}ms${LOG_COLORS.reset}`;

    const line = `${LOG_COLORS.dim}[${this.formatTime()}]${LOG_COLORS.reset} ${LOG_COLORS.magenta}[HTTP]${LOG_COLORS.reset} ${methodColor}${method}${LOG_COLORS.reset} ${url} ${statusColor}${status}${LOG_COLORS.reset} ${durationTag}${reqIdTag}`;
    console.log(line);
  }
}

export const logger = new Logger();

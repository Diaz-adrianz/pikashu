import fs from 'node:fs';
import path from 'node:path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.resolve(process.cwd(), process.env.LOG_DIR ?? 'logs');
const logName = process.env.LOG_NAME ?? 'app';

fs.mkdirSync(logDir, { recursive: true });

const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const consoleFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf((info) => {
    const { timestamp, level, message, service, stack, ...meta } = info;
    const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${service}] ${level}: ${message}${stack ? `\n${stack}` : ''}${details}`;
  })
);

function dailyRotateFile(kind: 'combined' | 'error') {
  return new DailyRotateFile({
    dirname: logDir,
    filename: `${logName}-${kind}-%DATE%.log`,
    auditFile: path.join(logDir, `.${logName}-${kind}-audit.json`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: kind === 'error' ? 'error' : 'info',
  });
}

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: logName },
  format: fileFormat,
  transports: [
    new transports.Console({ format: consoleFormat }),
    dailyRotateFile('combined'),
    dailyRotateFile('error'),
  ],
});

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

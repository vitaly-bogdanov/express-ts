import { basename } from 'path';
import { createLogger, format, transports, Logger } from 'winston';

export const init = (filename: string): Logger => {
  const file = basename(filename);
  return createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}](${file}): ${message}`;
      }),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/errors.log', level: 'error' }),
      new transports.File({ filename: 'logs/log.log', level: 'info' }),
    ],
  });
};

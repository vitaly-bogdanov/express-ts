import { Request, Response, NextFunction } from 'express';
import { init } from '../../wrappers/logger.wrapper';

const logger = init(__filename);

/**
 * Логгирует время запроса
 */
export async function requestTimeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.info(`${req.method} ${req.url}`);
  const startTime = Date.now();
  await next();
  const endTime = Date.now();
  logger.info(`${req.method} ${req.url} ${endTime - startTime}ms`);
}

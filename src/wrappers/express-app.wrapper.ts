import express, { Express } from 'express';
import 'express-async-errors';
import domain from '../domain';
import { requestTimeMiddleware } from '../middlewares/request-time.middleware';
import { errorHandlerMiddleware } from '../middlewares/error-handler.middleware';
import { init } from './logger.wrapper';
import { getConfig } from '../wrappers/config.wrapper';
import { notFound } from '../wrappers/api-error.wrapper';
import { swagger } from '../wrappers/swagger.wrapper';

const logger = init(__filename);

export function createApp(): Express {
  logger.info('init application');
  const config = getConfig();
  return express()
    .use(requestTimeMiddleware)
    .use(
      express.urlencoded({
        extended: true,
      }),
    )
    .use(express.json())
    .use(`/${config.PREFIX}/`, ...domain)
    .use(`/${config.PREFIX}/docs`, ...swagger)
    .use(() => {
      throw notFound();
    })
    .use(errorHandlerMiddleware);
}

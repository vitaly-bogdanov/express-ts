import { createApp } from './wrappers/express-app.wrapper';
import { HttpServer } from './wrappers/http-server.wrapper';
import { init } from './wrappers/logger.wrapper';
import { getConfig } from './wrappers/config.wrapper';
import * as someDbNameService from './services/some-db-name.service';
import * as cacheService from './services/cache.service';

const logger = init(__filename);

(async () => {
  try {
    const config = getConfig();
    await cacheService.connect();
    someDbNameService.connect();
    new HttpServer(createApp(), config.HOST, config.PORT).start();
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
})();

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
  process.on(signal, async () => {
    logger.info(`Caught signal ${signal}`);
    await someDbNameService.disconnect();
    await cacheService.disconnect();
    process.exit(0);
  }),
);

process.on('uncaughtException', async (error) => {
  logger.info(`Uncaught exception! ${error.message}`);
  await someDbNameService.disconnect();
  await cacheService.disconnect();
  process.exit(1);
});

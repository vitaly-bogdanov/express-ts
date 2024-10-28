import { Sql } from 'postgres';
import { Postres } from '../../wrappers/postgres.wrapper';
import { init } from '../../wrappers/logger.wrapper';
import { getConfig } from '../../wrappers/config.wrapper';

const logger = init(__filename);

let someDbName: Postres;

export function connect(): Sql {
  const config = getConfig();
  logger.info(
    `connect to "${config.SOME_DB_NAME_DATABASE_NAME}", ${config.SOME_DB_NAME_HOST}:${config.SOME_DB_NAME_PORT}`,
  );
  someDbName = new Postres(
    config.SOME_DB_NAME_HOST,
    config.SOME_DB_NAME_PORT,
    config.SOME_DB_NAME_DATABASE_NAME,
    config.SOME_DB_NAME_USERNAME,
    config.SOME_DB_NAME_PASSWORD,
  );
  return someDbName.connection;
}

export async function disconnect(): Promise<void> {
  const config = getConfig();
  logger.info(`disconnect from "${config.SOME_DB_NAME_DATABASE_NAME}"`);
  await someDbName.disconnect();
}

export function getConnection(): Sql {
  return someDbName.connection;
}

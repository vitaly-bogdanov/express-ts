import { RedisClientType, createClient } from 'redis';
import { init } from '../../wrappers/logger.wrapper';
import { getConfig } from '../../wrappers/config.wrapper';

const logger = init(__filename);

const config = getConfig();

let redisClient: RedisClientType;

export async function connect(): Promise<void> {
  logger.info('connect to cache server');
  redisClient = createClient({
    socket: {
      host: config.CACHE_HOST,
      port: config.CACHE_PORT,
    },
  });

  await redisClient.connect();
  logger.info('success');
}

export async function disconnect(): Promise<void> {
  logger.info('disconnect cache server');
  if (redisClient) {
    await redisClient.quit();
  }
  logger.info('success');
}

export async function setData(key: string, data: object): Promise<void> {
  await redisClient.setEx(key, config.CACHE_EXPIRE, JSON.stringify(data));
}

export async function getData(key: string): Promise<object | null> {
  const strData = await redisClient.get(key);
  return strData ? JSON.parse(strData) : null;
}

export async function getTtl(key: string): Promise<number> {
  return redisClient.ttl(key);
}

export async function clear(): Promise<void> {
  await redisClient.flushDb();
}

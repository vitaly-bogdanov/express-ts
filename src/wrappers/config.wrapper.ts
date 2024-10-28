import dotenv, { DotenvConfigOutput } from 'dotenv';
import path from 'path';

let config: DotenvConfigOutput;

export function getConfig(): any {
  const env = process.env.NODE_ENV || 'dev';
  const envFileName = `.env.${env}`;
  config = dotenv.config({ path: path.resolve(process.cwd(), envFileName) });
  if (config.error) {
    throw config.error;
  }
  return config.parsed;
}

import { Request, Response } from 'express';
import { init } from '../../../../wrappers/logger.wrapper';
import { httpCodes } from '../../../../constants';
import { getItemsList } from '../../items.service';
import * as cacheService from '../../../../services/cache.service';

const logger = init(__filename);

export async function getList(req: Request, res: Response): Promise<void> {
  logger.info('get list');
  const itemsList = await getItemsList();

  await cacheService.setData(req.originalUrl, itemsList);

  res.status(httpCodes.OK).json(itemsList);
  logger.info('success');
}

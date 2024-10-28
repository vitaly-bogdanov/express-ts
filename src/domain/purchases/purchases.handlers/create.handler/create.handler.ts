import { Request, Response } from 'express';
import { init } from '../../../../wrappers/logger.wrapper';
import { httpCodes } from '../../../../constants';
import { ICustomRequest } from '../../../../wrappers/jwt.wrapper';
import { createPurchase } from '../../purchases.service';

const logger = init(__filename);

/**
 *
 * POST /purchases
 */
export async function createHandler(
  req: Request,
  res: Response,
): Promise<void> {
  logger.info('create purchase');
  const { id } = (req as ICustomRequest).payload;
  const { items } = req.body;

  const balance = await createPurchase(id, items);

  res.status(httpCodes.CREATED).json({ balance });
  logger.info('success');
}

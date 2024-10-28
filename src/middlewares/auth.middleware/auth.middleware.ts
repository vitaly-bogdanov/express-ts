import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../wrappers/jwt.wrapper/jwt.wrapper';
import { unauthorized } from '../../wrappers/api-error.wrapper';
import { init } from '../../wrappers/logger.wrapper';
import { ICustomRequest } from '../../wrappers/jwt.wrapper';
import { getTokenById } from './auth.service';

const logger = init(__filename);

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.info('check token');
  const authStr = req.header('Authorization');
  if (typeof authStr !== 'string') {
    throw unauthorized();
  }
  const authorization = authStr.split(' ');
  if (authorization[0] !== 'Bearer' || authorization.length !== 2) {
    throw unauthorized();
  }
  const token = authorization[1];
  try {
    const payload = verifyAccessToken(token);
    (req as ICustomRequest).payload = payload;

    const savedToken = await getTokenById(payload.id);

    if (!savedToken && savedToken !== token) {
      throw new Error();
    }
  } catch (error) {
    const err = error as Error;
    logger.info(err.message);
    next(unauthorized('token expired or invalid, please refresh your token'));
  }
  logger.info('success');
  next();
}

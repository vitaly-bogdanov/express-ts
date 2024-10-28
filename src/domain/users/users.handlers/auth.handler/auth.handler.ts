import { Request, Response } from 'express';
import { init } from '../../../../wrappers/logger.wrapper';
import { compare } from '../../../../wrappers/bcrypt.wrapper';
import { unauthorized } from '../../../../wrappers/api-error.wrapper';
import { getOneByName, updateToken } from '../../users.service';
import { getAccessToken } from '../../../../wrappers/jwt.wrapper/jwt.wrapper';
import { httpCodes } from '../../../../constants';

const logger = init(__filename);

/**
 *
 * POST /auth
 */
export async function authHandler(req: Request, res: Response): Promise<void> {
  logger.info('user auth');
  const { name, password } = req.body;
  const user = await getOneByName(name);

  if (!user) {
    throw unauthorized('invalid username or invalid password');
  }

  if (!(await compare(password, user.password))) {
    throw unauthorized('invalid username or invalid password');
  }

  const accessToken = getAccessToken({ id: user.id, name });

  await updateToken(user.id, accessToken);

  res.status(httpCodes.OK).json({ accessToken, refreshToken: 'none' });
  logger.info('success');
}

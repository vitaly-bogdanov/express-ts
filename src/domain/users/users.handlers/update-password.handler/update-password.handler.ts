import { Request, Response } from 'express';
import { init } from '../../../../wrappers/logger.wrapper';
import { getOneByName } from '../../users.service';
import { ICustomRequest } from '../../../../wrappers/jwt.wrapper';
import { compare } from '../../../../wrappers/bcrypt.wrapper';
import { conflict } from '../../../../wrappers/api-error.wrapper';
import { updatePasswordById, updateToken } from '../../users.service';
import { httpCodes } from '../../../../constants';

const logger = init(__filename);

/**
 *
 * PATCH /user
 */
export async function updatePasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  logger.info('update user password');
  const {
    body: { newPassword, oldPassword },
  } = req;

  const { id, name } = (req as ICustomRequest).payload;

  const user = await getOneByName(name);

  if (!user) {
    throw conflict('user not found');
  }

  if (!(await compare(oldPassword, user.password))) {
    throw conflict('invalid username or invalid password');
  }

  if (newPassword === oldPassword) {
    throw conflict('old and new passwords must not be the same');
  }

  await Promise.all([
    updatePasswordById(id, newPassword),
    updateToken(id, null),
  ]);

  res.status(httpCodes.NO_CONTENT).end();
  logger.info('success');
}

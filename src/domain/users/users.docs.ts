import { authDoc } from './users.handlers/auth.handler';
import { updatePasswordDoc } from './users.handlers/update-password.handler';

export const usersDocs = {
  '/users': { ...updatePasswordDoc },
  '/users/auth': { ...authDoc },
};

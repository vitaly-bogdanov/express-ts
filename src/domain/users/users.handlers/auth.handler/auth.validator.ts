import { body } from 'express-validator';
import { PASSWORD_LENGTH, NAME_LENGTH } from '../../users.constants';
import { validator } from '../../../../middlewares/validator.middleware';

export const authValidator = [
  body('password')
    .exists()
    .withMessage('required field')
    .bail()
    .isString()
    .withMessage('invalid type')
    .bail()
    .trim()
    .isLength({ min: PASSWORD_LENGTH.MIN, max: PASSWORD_LENGTH.MAX })
    .withMessage(
      `length should be from ${PASSWORD_LENGTH.MIN} to ${PASSWORD_LENGTH.MAX} characters`,
    ),

  body('name')
    .exists()
    .withMessage('required field')
    .bail()
    .isString()
    .withMessage('invalid type')
    .bail()
    .trim()
    .isLength({ min: NAME_LENGTH.MIN, max: NAME_LENGTH.MAX })
    .withMessage(
      `length should be from ${NAME_LENGTH.MIN} to ${NAME_LENGTH.MAX} characters`,
    ),

  validator,
];

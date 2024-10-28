import { body } from 'express-validator';
import { PASSWORD_LENGTH } from '../../users.constants';
import { validator } from '../../../../middlewares/validator.middleware';

export const updatePasswordValidator = [
  ...['newPassword', 'oldPassword'].map((fieldName) =>
    body(fieldName)
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
  ),

  validator,
];

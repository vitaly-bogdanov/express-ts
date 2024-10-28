import { body } from 'express-validator';
import { validator } from '../../../../middlewares/validator.middleware';

export const createValidator = [
  body('items')
    .exists()
    .withMessage('required field')
    .bail()
    .isArray({ min: 1 })
    .withMessage('invalid value')
    .bail(),

  body('items.*.quantity')
    .exists()
    .withMessage('required field')
    .bail()
    .isInt({ min: 1 })
    .withMessage('invalid field'),

  body('items.*.id')
    .exists()
    .withMessage('required field')
    .bail()
    .isInt()
    .withMessage('invalid field'),

  validator,
];

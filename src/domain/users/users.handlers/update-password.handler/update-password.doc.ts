import {
  unauthorized,
  unprocessableEntity,
  internalError,
} from '../../../../wrappers/api-error.wrapper';
import { httpCodes } from '../../../../constants';

export const updatePasswordDoc = {
  patch: {
    description: 'Update password',
    tags: ['User'],
    requestBody: {
      description: 'Update password',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['newPassword', 'oldPassword'],
            properties: {
              newPassword: {
                type: 'string',
                example: '123456',
              },
              oldPassword: {
                type: 'string',
                example: '123456',
              },
            },
          },
        },
      },
    },
    responses: {
      [httpCodes.NO_CONTENT]: {
        description: 'No content',
      },
      [httpCodes.UNAUTHORIZED]: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: unauthorized().message,
                  },
                },
              },
            },
          },
        },
      },
      [httpCodes.UNPROCESSABLE_ENTITY]: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: unprocessableEntity().message,
                  },
                },
              },
            },
          },
        },
      },
      [httpCodes.INTERNAL_ERROR]: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: internalError().message,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

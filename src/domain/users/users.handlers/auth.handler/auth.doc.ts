import {
  unauthorized,
  unprocessableEntity,
  internalError,
} from '../../../../wrappers/api-error.wrapper';
import { httpCodes } from '../../../../constants';

export const authDoc = {
  post: {
    description: 'Auth user',
    tags: ['User'],
    requestBody: {
      description: 'Auth data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'password'],
            properties: {
              name: {
                type: 'string',
                example: 'admin',
              },
              password: {
                type: 'string',
                example: 'admin',
              },
            },
          },
        },
      },
    },
    responses: {
      [httpCodes.OK]: {
        description: 'Return tokens',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
                refreshToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      [httpCodes.UNAUTHORIZED]: {
        content: {
          'application/json': {
            schema: {
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

import {
  unauthorized,
  unprocessableEntity,
  internalError,
} from '../../../../wrappers/api-error.wrapper';
import { httpCodes } from '../../../../constants';

export const createDoc = {
  post: {
    description: 'Create purchase',
    tags: ['Purchase'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                      example: 1,
                    },
                    quantity: {
                      type: 'number',
                      example: 2,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      [httpCodes.CREATED]: {
        description: 'Return balance',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                balance: {
                  type: 'string',
                  example: '100.21',
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
      [httpCodes.INTERNAL_ERROR]: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
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
};

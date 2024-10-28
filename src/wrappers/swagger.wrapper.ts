import swaggerUI from 'swagger-ui-express';
import { getConfig } from './config.wrapper';
import { usersDocs } from '../domain/users';
import { purchaseDocs } from '../domain/purchases';
import { itemsDocs } from '../domain/items';

const config = getConfig();

export const swagger = [
  swaggerUI.serve,
  swaggerUI.setup({
    openapi: '3.0.0',
    info: {
      title: 'Test app',
      description: 'test',
      license: 'test',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      requestBodies: {},
      responses: [],
    },
    security: [{ bearerAuth: [] }],
    tags: [],
    servers: [
      {
        url: `http://${config.HOST}${config.PORT}/${config.PREFIX}`,
        description: `dev server`,
      },
    ],
    paths: {
      ...usersDocs,
      ...purchaseDocs,
      ...itemsDocs,
    },
  }),
];

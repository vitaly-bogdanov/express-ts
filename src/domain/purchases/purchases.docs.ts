import { createDoc } from './purchases.handlers/create.handler';

export const purchaseDocs = {
  '/purchases': { ...createDoc },
};

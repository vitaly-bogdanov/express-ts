import { getListDoc } from './items.handlers/get-list.handler';

export const itemsDocs = {
  '/items': { ...getListDoc },
};

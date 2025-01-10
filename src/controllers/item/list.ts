import type { Request, Response } from 'express';

import type { ListItemFilter, ListItemSorts } from '../../modules/items/types';
import { listItems } from '../../modules/items';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import Controller from '../controller';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.query, {
    title: { type: 'string' },
    priceGte: { type: 'number' },
    priceLte: { type: 'number' },
    page: { type: 'number' },
    pageSize: { type: 'number' },
    limit: { type: 'number' },
    sort: { type: 'sort' },
  });

  if (!data) return;

  const filter = {
    title: data.title,
    priceGte: data.priceGte,
    priceLte: data.priceLte,
  } as ListItemFilter;

  const listOpts = {
    page: data.page,
    pageSize: data.pageSize,
    limit: data.limit,
    sort: data.sort as ListItemSorts,
  };

  const result = await listItems(filter, listOpts);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { items: result },
  };
  this.next();
}

const listItemsController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'ListItemsController',
    validPermissions: [PermissionsEnum.inventory],
  }).run();
};

export default listItemsController;

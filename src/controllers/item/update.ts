import type { Request, Response } from 'express';

import { updateItem } from '../../modules/items';
import Controller from '../controller';
import { PermissionsEnum } from '../../global/interfaces/permissions';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    id: { type: 'string', options: { required: true } },
    title: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    properties: { type: 'object' },
    amountStorage: { type: 'number' },
    active: { type: 'boolean' },
  });

  if (!data) return;

  const result = await updateItem(data);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { id: result },
  };
  this.next();
}

const updateItemController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'UpdateItemController',
    validPermissions: PermissionsEnum.inventory,
  }).run();
};

export default updateItemController;

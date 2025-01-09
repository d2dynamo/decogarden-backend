import type { Request, Response } from 'express';
import { addItem } from '../../modules/items';

import Controller from '../controller';
import { PermissionsEnum } from '../../global/interfaces/permissions';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    title: { type: 'string', options: { required: true } },
    description: { type: 'string' },
    price: { type: 'number', options: { required: true } },
    properties: { type: 'object' },
    amountStorage: { type: 'number' },
    active: { type: 'boolean' },
  });

  const result = await addItem(data);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { id: result },
  };
  this.next();
}

const addItemController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'AddItemController',
    validPermissions: [PermissionsEnum.inventory],
  }).run();
};

export default addItemController;

import type { Request, Response } from 'express';

import Controller from '../controller';
import { getItem } from '../../modules/items';
import { PermissionsEnum } from '../../global/interfaces/permissions';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: 'string', options: { required: true } },
  });

  const result = await getItem(data.id);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { item: result },
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

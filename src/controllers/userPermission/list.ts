import type { Request, Response } from 'express';

import listUserPermissions from '../../modules/userPermissions/list';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import Controller from '../controller';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.query, {
    userId: { type: 'string', options: { required: true } },
  });

  const result = await listUserPermissions(data.userId);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { permissions: result },
  };
  this.next();
}

const listUserPermissionsController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, logic, {
    name: 'ListUserPermissionsController',
    validPermissions: PermissionsEnum.admin,
  }).run();
};

export default listUserPermissionsController;

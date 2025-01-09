import type { Request, Response } from 'express';

import { listPermissions } from '../../modules/permissions';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import Controller from '../controller';

async function logic(this: Controller) {
  const permissions = await listPermissions();

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { permissions },
  };
  this.next();
}

const listPermissionsController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, logic, {
    name: 'ListPermissionsController',
    validPermissions: PermissionsEnum.admin,
  }).run();
};

export default listPermissionsController;

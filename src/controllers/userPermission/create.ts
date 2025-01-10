import type { Request, Response } from 'express';

import { PermissionsEnum } from '../../global/interfaces/permissions';
import setUserPermission from '../../modules/userPermissions/set';

import Controller from '../controller';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userId: { type: 'string', options: { required: true } },
    permissionId: { type: 'string', options: { required: true } },
    active: { type: 'boolean' },
  });

  const result = await setUserPermission(data);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { id: result },
  };
  this.next();
}

const setUserPermissionController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, logic, {
    name: 'SetUserPermissionController',
    validPermissions: PermissionsEnum.admin,
  }).run();
};

export default setUserPermissionController;

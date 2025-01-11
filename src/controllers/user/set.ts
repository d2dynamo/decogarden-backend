import type { Request, Response } from 'express';

import Controller from '../controller';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import { archiveUser } from '../../modules/users';

async function updateUserLogic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    id: { type: 'string', options: { required: true } },
    userName: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
  });

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: {},
  };
}

export const updateUserController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, updateUserLogic, {
    name: 'updateUserController',
    errorLevel: 2,
  }).run();
};

async function archiveUserLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: 'string', options: { required: true } },
  });

  const result = await archiveUser(data.id);

  if (!result) {
    throw new Error(`Failed to archive user`);
  }

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: {},
  };
}

export const archiveUserController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, archiveUserLogic, {
    name: 'archiveUserController',
    errorLevel: 2,
    validPermissions: PermissionsEnum.admin,
  }).run();
};

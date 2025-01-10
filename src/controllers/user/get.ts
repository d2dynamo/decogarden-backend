import type { Request, Response } from 'express';

import { getUser, getUserBasic } from '../../modules/users';
import Controller from '../controller';
import { PermissionsEnum } from '../../global/interfaces/permissions';

async function getUserLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: 'string', options: { required: true } },
  });

  if (!this.req.user.id || this.req.user.id !== data.id) {
    this.locals = {
      error: true,
      code: 401,
      message: 'Unauthorized',
      payload: {},
    };
    this.next();
    return;
  }

  const result = await getUser(data);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { user: result },
  };
  this.next();
}

export const getUserController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, getUserLogic, {
    name: 'GetUserController',
    validPermissions: PermissionsEnum.sales,
  }).run();
};

async function getUserBasicLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: 'string', options: { required: true } },
  });

  const result = await getUserBasic(data);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { user: result },
  };
  this.next();
}

export const getUserBasicController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, getUserBasicLogic, {
    name: 'GetUserBasicController',
    validPermissions: PermissionsEnum.customer,
  }).run();
};

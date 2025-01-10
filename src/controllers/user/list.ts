import type { Request, Response } from 'express';

import type { ListUserFilter, ListUserSorts } from '../../modules/users/types';
import type { ListOptions } from '../../global/interfaces/controller';
import listUsers from '../../modules/users/list';
import Controller from '../controller';
import { PermissionsEnum } from '../../global/interfaces/permissions';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.query, {
    name: { type: 'string' },
    email: { type: 'string' },
    page: { type: 'number' },
    pageSize: { type: 'number' },
    limit: { type: 'number' },
    sort: { type: 'sort' },
  });

  if (!data) return;

  const filter = {
    name: data.name,
    email: data.email,
  } as ListUserFilter;
  const listOpts = {
    page: data.page,
    pageSize: data.pageSize,
    limit: data.limit,
    sort: data.sort,
  } as ListOptions<ListUserSorts>;

  const result = await listUsers(filter, listOpts);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { users: result },
  };
  this.next();
}

const listUsersController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'ListUsersController',
    errorLevel: 2,
    validPermissions: [PermissionsEnum.customer],
  }).run();
};

export default listUsersController;

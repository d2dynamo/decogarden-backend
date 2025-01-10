import type { Request, Response } from 'express';

import Controller from '../controller';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import { archiveUser } from '../../modules/users';

async function logic(this: Controller) {
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

const archiveUserController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'archiveUserController',
    errorLevel: 2,
    validPermissions: PermissionsEnum.admin,
  }).run();
};

export default archiveUserController;

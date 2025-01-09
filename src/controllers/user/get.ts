import type { Request, Response } from 'express';

import getUser from '../../modules/users/get';
import Controller from '../controller';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: 'string', options: { required: true } },
  });

  const result = await getUser(data.id);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { user: result },
  };
  this.next();
}

const getUserController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'GetUserController',
  }).run();
};

export default getUserController;

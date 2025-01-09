import type { Request, Response } from 'express';

import createUser from '../../modules/users/create';
import Controller from '../controller';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userName: { type: 'string', options: { required: true } },
    email: { type: 'string', options: { required: true } },
    phone: { type: 'string' },
  });

  const result = await createUser(data.userName, data.email, data.phone);

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: { id: result },
  };
  this.next();
}

const createUserController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'CreateUserController',
    errorLevel: 2,
  }).run();
};

export default createUserController;

import type { Request, Response } from 'express';

import Controller from '../controller';

async function logic(this: Controller) {
  const data = await this.validateData(this.req.query, {
    secret: { type: 'string' },
  });

  if (data.secret === 'big') {
    this.locals = {
      error: false,
      code: 200,
      message: 'big if true',
    };
    this.next();
    return;
  }

  this.locals = {
    error: false,
    code: 200,
    message: 'Hello world',
  };
  this.next();
}

const helloController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: 'HelloController',
  }).run();
};

export default helloController;

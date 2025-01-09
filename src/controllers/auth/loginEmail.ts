import type { Request, Response } from 'express';

import { generateToken } from '../../modules/token';
import Controller from '../controller';

async function loginUserWithEmailLogic(this: Controller) {
  const accessToken = await generateToken({
    userId: this.req.user.id,
    email: this.req.user.email,
    expiration: '30m',
    type: 'access_token',
  });

  const refreshToken = await generateToken({
    userId: this.req.user.id,
    email: this.req.user.email,
    expiration: '1d',
    type: 'refresh_token',
  });

  this.locals = {
    error: true,
    code: 200,
    message: 'success',
    payload: {
      accessToken,
      refreshToken,
    },
  };
  this.next();
}

const loginUserWithEmailController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, loginUserWithEmailLogic, {
    name: 'loginUserWithEmail',
    errorLevel: 2,
  }).run();
};

export default loginUserWithEmailController;

import type { Request, Response } from 'express';

import { generateToken, validateToken } from '../../modules/token';
import { UserError } from '../../util/error';
import Controller from '../controller';

async function refreshTokensLogic(this: Controller) {
  const refreshToken = this.req.cookies.RefreshToken;

  if (!refreshToken) {
    throw new UserError('No refresh token provided', 400);
  }

  const decoded = await validateToken(refreshToken, 'refresh_token');

  if (
    !decoded.verified ||
    !decoded.jwt ||
    !decoded.jwt.payload ||
    !decoded.jwt.payload.sub ||
    !decoded.jwt.payload.sub_email
  ) {
    throw new UserError('Invalid refresh token', 400);
  }

  const accessToken = await generateToken({
    userId: decoded.jwt.payload.sub,
    email: decoded.jwt.payload.sub_email,
    expiration: '30m',
    type: 'access_token',
  });

  const refreshTokenNew = await generateToken({
    userId: decoded.jwt.payload.sub,
    email: decoded.jwt.payload.sub_email,
    expiration: '1d',
    type: 'refresh_token',
  });

  this.locals = {
    error: false,
    code: 200,
    message: 'success',
    payload: {
      accessToken,
      refreshToken: refreshTokenNew, //send function handles setting the cookie
    },
  };
  this.next();
}

const refreshTokensController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, refreshTokensLogic, {
    name: 'refreshToken',
    errorLevel: 2,
  }).run();
};

export default refreshTokensController;

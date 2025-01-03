import type { Request, Response } from 'express';
import { generateToken, validateToken } from '../../modules/token';
import { UserError } from '../../util/error';
import logger from '../../modules/logger';

export async function loginUserWithEmail(
  req: Request,
  res: Response,
  next: Function
) {
  try {
    const user = req.user;
    if (!user) {
      throw new Error(`No user found in request`);
    }

    const accessToken = await generateToken({
      userId: user.id,
      email: user.email,
      expiration: '30m',
      type: 'access_token',
    });

    const refreshToken = await generateToken({
      userId: user.id,
      email: user.email,
      expiration: '4h',
      type: 'refresh_token',
    });

    res.locals = {
      error: true,
      code: 200,
      message: 'success',
      payload: {
        accessToken,
        refreshToken,
      },
    };
    next();
  } catch (err) {
    logger.error(1, 'loginUserWithEmail controller:', {
      userId: req.user?.id,
      error: err,
    });
    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
    };
    next();
  }
}

export async function refreshTokens(
  req: Request,
  res: Response,
  next: Function
) {
  try {
    const refreshToken = req.cookies.RefreshToken;

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
      expiration: '4h',
      type: 'refresh_token',
    });

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {
        accessToken,
        refreshToken: refreshTokenNew,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      logger.error(8, 'failed to refresh token for user', {
        userId: req.user?.id,
        error: err,
      });
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
      };
      next();
      return;
    }

    logger.error(2, 'refreshTokens controller:', {
      userId: req.user?.id,
      error: err,
      headers: req.headers,
      body: req.body,
    });

    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
    };
    next();
  }
}

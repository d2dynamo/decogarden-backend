import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import verifyUser from '../../modules/users/verify';
import logger from '../../modules/logger';

export async function cVerifyEmail(
  req: Request,
  res: Response,
  next: Function
) {
  const errs = {};

  try {
    const { code, password } = req.body;

    if (!code) {
      res.locals = {
        error: true,
        code: 400,
        message: 'missing verification code',
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    await verifyUser(code, password, true, false);

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {
        errors: errs,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    logger.error(2, 'failed to validate email for user', {
      userId: req.user?.id,
      error: err,
      headers: req.headers,
      body: req.body,
    });

    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
      payload: {
        errors: errs,
      },
    };
    next();
  }
}

export async function cVerifyPhone(
  req: Request,
  res: Response,
  next: Function
) {
  const errs = {};

  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code) {
      res.locals = {
        error: true,
        code: 400,
        message: 'missing verification code',
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    await verifyUser(code, '', false, true);

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {
        errors: errs,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    logger.error(2, 'failed to validate phone for user', {
      userId: req.user?.id,
      error: err,
      headers: req.headers,
      body: req.body,
    });

    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
      payload: {
        errors: errs,
      },
    };
    next();
  }
}

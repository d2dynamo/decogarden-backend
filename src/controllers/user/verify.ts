import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import verifyUser from "../../modules/users/verify";

export async function cVerifyEmail(
  req: Request,
  res: Response,
  next: Function
) {
  const errs = {};

  try {
    const { code } = req.body;

    if (!code) {
      res.locals = {
        error: true,
        code: 400,
        message: "missing verification code",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    await verifyUser(code, true, false);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
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
        message: err.message || "unknown client error",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }
    console.log("controller:", err);
    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
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
        message: "missing verification code",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    await verifyUser(code, false, true);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
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
        message: err.message || "unknown client error",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }
    console.log("controller:", err);
    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
      payload: {
        errors: errs,
      },
    };
    next();
  }
}
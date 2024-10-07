import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { verify2fa } from "../../modules/users/authenticator";

export default async function cValidate2fa(
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
        message: "missing 2fa code",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    await verify2fa(userId, code);

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

    console.log("controller validate2fa:", err);

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

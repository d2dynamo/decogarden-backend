import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { enable2fa, generate2fa } from "../../modules/users/authenticator";
import { stringToObjectId } from "../../modules/database/mongo";

export default async function cGenerate2fa(
  req: Request,
  res: Response,
  next: Function
) {
  const errs = {};
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const userObjId = await stringToObjectId(userId);
    if (!userObjId) {
      res.locals = {
        error: true,
        code: 400,
        message: "invalid user id",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    if (!password) {
      res.locals = {
        error: true,
        code: 400,
        message: "password required for setting 2fa",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    const code = await generate2fa(userObjId, password);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: {
        errors: errs,
        code,
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

    console.log("controller gen2fa:", err);

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

export async function cEnable2fa(req: Request, res: Response, next: Function) {
  const errs = {};
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!userId || !code) {
      res.locals = {
        error: true,
        code: 400,
        message: "missing user id or code",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    await enable2fa(userId, code);

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

    console.log("controller enable2fa:", err);

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
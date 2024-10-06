import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import userHasPermission from "../../modules/userPermissions/get";
import getUser from "../../modules/users/get";

export default async function (req: Request, res: Response, next: Function) {
  const errs = [];
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      res.locals = {
        error: true,
        code: 400,
        message: "missing id",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    if (userId !== id && !(await userHasPermission(userId, "admin"))) {
      res.locals = {
        error: true,
        code: 403,
        message: "forbidden",
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    const user = await getUser(id);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: {
        errors: errs,
        user,
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

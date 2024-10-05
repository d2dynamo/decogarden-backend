import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type { SetUser } from "../../modules/users/types";

type AddUserErrors = {
  [K in keyof SetUser]?: string;
};

export default async function (req: Request, res: Response, next: Function) {
  const errs: AddUserErrors = {};
  try {
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || "unknown client error",
        payload:
          Object.keys(errs).length > 0
            ? {
                errors: errs,
              }
            : {},
      };
      next();
      return;
    }

    console.log("controller:", err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
      payload:
        Object.keys(errs).length > 0
          ? {
              errors: errs,
            }
          : {},
    };
    next();
  }
}

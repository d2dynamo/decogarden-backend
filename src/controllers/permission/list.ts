import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { listPermissions } from "../../modules/permissions";

export default async function (req: Request, res: Response, next: Function) {
  try {
    const result = await listPermissions();

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: {
        data: result,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || "unknown client error",
      };
      next();
      return;
    }

    console.log(err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}

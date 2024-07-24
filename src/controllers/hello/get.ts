import type { Request, Response } from "express";

import { UserError } from "../../util/error";

export default async function getHello(
  req: Request,
  res: Response,
  next: Function
) {
  try {
    const secret = req.body.secret;

    if (secret == "big") {
      res.locals = {
        error: false,
        message: "big if true",
        code: 200,
        payload: {},
      };
      next();
      return;
    }

    res.locals = {
      error: false,
      message: "hello world",
      code: 200,
      payload: {
        data: "Hi!",
      },
    };
    next();
  } catch (err: any) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        message: err.message,
        code: err.code,
        payload: {},
      };
      next();
      return;
    }

    console.log(err);
    res.locals = {
      error: true,
      message: "internal server error",
      code: 500,
      payload: {},
    };
    next();
  }
}

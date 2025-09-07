import type { Request, Response } from "express";

import Controller from "../controller";
import { generateToken } from "modules/token";

async function loginUserWithEmailLogic(this: Controller) {
  const accessToken = await generateToken({
    userId: this.req.user.id,
    email: this.req.user.email,
    expiration: "30m",
    type: "access_token",
  });

  const refreshToken = await generateToken({
    userId: this.req.user.id,
    email: this.req.user.email,
    expiration: "1d",
    type: "refresh_token",
  });

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {
      accessToken,
      refreshToken,
    },
  };
}

const loginUserWithEmailController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, loginUserWithEmailLogic, {
    name: "loginUserWithEmail",
    errorLevel: 2,
  }).run();
};

export default loginUserWithEmailController;

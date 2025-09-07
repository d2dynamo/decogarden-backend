import type { Request, Response } from "express";

import { generate2fa, enable2fa, verify2fa } from "modules/users/authenticator";
import Controller from "../controller";

async function generate2faLogic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userId: {
      type: "string",
      options: { required: true },
    },
    password: {
      type: "string",
      options: { required: true },
    },
  });

  const secret = await generate2fa(data.userId, data.password);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {
      secret,
    },
  };
}

export const generate2faController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, generate2faLogic, {
    name: "generate2fa",
    errorLevel: 2,
    validPermissions: "self", // No permissions required
  }).run();
};

async function enable2faLogic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userId: {
      type: "string",
      options: { required: true },
    },
    token: {
      type: "string",
      options: { required: true },
    },
  });

  await enable2fa(data.userId, data.token);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {},
  };
}

export const enable2faController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, enable2faLogic, {
    name: "enable2fa",
    errorLevel: 2,
    validPermissions: "self",
  }).run();
};

async function verify2faLogic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userId: {
      type: "string",
      options: { required: true },
    },
    token: {
      type: "string",
      options: { required: true },
    },
  });

  await verify2fa(data.userId, data.token);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {},
  };
}

export const verify2faController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, verify2faLogic, {
    name: "verify2fa",
    errorLevel: 2,
  }).run();
};

import type { Request, Response } from "express";

import Controller from "../controller";
import userLayer from "modules/database/user";
import { PermissionsEnum } from "global/const";

async function getUserLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: "string", options: { required: true } },
  });

  if (!this.req.user.id || this.req.user.id !== data.id) {
    this.locals = {
      error: true,
      code: 401,
      message: "Unauthorized",
      payload: {},
    };
    return;
  }

  const result = await userLayer.get(data.id);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { user: result },
  };
}

export const getUserController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, getUserLogic, {
    name: "GetUserController",
    validPermissions: PermissionsEnum.sales,
  }).run();
};

async function getUserBasicLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: "objectId", options: { required: true } },
  });

  const result = await userLayer.get(data.id, {
    projection: { userName: 1, email: 1 },
  });

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { user: result },
  };
}

export const getUserBasicController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, getUserBasicLogic, {
    name: "GetUserBasicController",
    validPermissions: PermissionsEnum.customer,
  }).run();
};

import type { Request, Response } from "express";

import Controller from "../controller";
import { PermissionsEnum } from "global/const";
import { permissionLayer } from "modules/database";

async function logic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    userId: { type: "objectId", options: { required: true } },
  });

  if (!data) return;

  const result = await permissionLayer.getUserPermissions(data.userId);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { permissions: result },
  };
}

const getUserPermissionsController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, logic, {
    name: "GetUserPermissionsController",
    validPermissions: ["self", PermissionsEnum.admin],
  }).run();
};

export default getUserPermissionsController;

import type { Request, Response } from "express";

import Controller from "../controller";
import { PermissionsEnum } from "global/const";
import { permissionLayer } from "modules/database";

async function logic(this: Controller) {
  const permissions = await permissionLayer.listAvailable();

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { permissions },
  };
}

const listPermissionsController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, logic, {
    name: "ListPermissionsController",
    validPermissions: PermissionsEnum.admin,
  }).run();
};

export default listPermissionsController;

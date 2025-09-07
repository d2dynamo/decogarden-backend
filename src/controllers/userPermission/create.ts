import type { Request, Response } from "express";

import { PermissionsEnum } from "global/const";
import Controller from "../controller";
import setUserPermission from "../../modules/userPermissions/set";

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userId: { type: "string", options: { required: true } },
    permissionId: { type: "string", options: { required: true } },
    active: { type: "boolean" },
  });

  await setUserPermission(data);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
  };
}

const setUserPermissionController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, logic, {
    name: "SetUserPermissionController",
    validPermissions: PermissionsEnum.admin,
  }).run();
};

export default setUserPermissionController;

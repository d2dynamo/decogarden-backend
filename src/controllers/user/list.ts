import type { Request, Response } from "express";

import Controller from "../controller";
import userLayer from "modules/database/user";
import { PermissionsEnum } from "global/const";

async function logic(this: Controller) {
  const filterData = await this.validateData(this.req.query, {
    userName: { type: "string" },
    email: { type: "string" },
  });
  const optionData = await this.validateData(this.req.query, {
    sort: { type: "sort" },
  });

  if (!filterData) return;

  const pagination = this.getPagination();

  const result = await userLayer.list(filterData, {
    skip: pagination.skip,
    limit: pagination.limit,
    sort: optionData.sort || { createdAt: 1 },
  });

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { users: result },
  };
}

const listUsersController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: "ListUsersController",
    errorLevel: 2,
    validPermissions: [PermissionsEnum.sales],
  }).run();
};

export default listUsersController;

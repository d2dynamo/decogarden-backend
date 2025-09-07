import type { Request, Response } from "express";

import Controller from "../controller";
import { updateItem } from "../../modules/items";
import { PermissionsEnum } from "global/const";

async function logic(this: Controller) {
  const idData = await this.validateData(this.req.params, {
    id: { type: "objectId", options: { required: true } },
  });
  const data = await this.validateData(this.req.body, {
    title: { type: "string" },
    description: { type: "string" },
    price: { type: "number" },
    properties: { type: "object" },
    amountStorage: { type: "number" },
    active: { type: "boolean" },
  });

  if (!data) return;

  const result = await updateItem(idData.id, data);

  if (!result) {
    throw new Error(`Failed to update item`);
  }

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { id: result },
  };
}

const updateItemController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: "UpdateItemController",
    validPermissions: PermissionsEnum.inventory,
  }).run();
};

export default updateItemController;

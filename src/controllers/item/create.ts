import type { Request, Response } from "express";

import Controller from "../controller";
import { PermissionsEnum } from "global/const";
import { itemLayer } from "modules/database";

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    title: { type: "string", options: { required: true } },
    description: { type: "string" },
    price: { type: "number", options: { required: true } },
    properties: { type: "object" },
    amountStorage: { type: "number" },
    active: { type: "boolean" },
  });

  const result = await itemLayer.create({
    ...data,
    amountStorage: data.amountStorage ?? 0,
    active: data.active ?? false,
  });

  if (!result.acknowledged) {
    throw new Error("failed to insert item");
  }

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { id: result.insertedId.toString() },
  };
}

const addItemController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: "AddItemController",
    validPermissions: [PermissionsEnum.inventory],
  }).run();
};

export default addItemController;

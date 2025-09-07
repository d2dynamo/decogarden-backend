import type { Request, Response } from "express";

import Controller from "../controller";
import { PermissionsEnum } from "global/const";
import { itemLayer } from "modules/database";
import { UserError } from "util/error";

async function getItemLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: "string", options: { required: true } },
  });

  const item = await itemLayer.get(data.id, { projection: { _id: 0 } });

  if (!item) {
    throw new UserError("item not found", 404);
  }

  if (!item.price) {
    throw new Error(`item missing price: ${item.price}`);
  }

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {
      item: {
        title: item.title || "unknown item",
        description: item.description || "",
        price: item.price,
        properties: item.properties,
        amountStorage: item.amountStorage || 0,
        active: item.active || false,
      },
    },
  };
}

const getItemController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, getItemLogic, {
    name: "GetItemController",
    validPermissions: [PermissionsEnum.inventory],
  }).run();
};

async function getItemBasicLogic(this: Controller) {
  const data = await this.validateData(this.req.params, {
    id: { type: "string", options: { required: true } },
  });

  const item = await itemLayer.get(data.id, {
    projection: { title: 1, price: 1 },
  });

  if (!item) {
    throw new UserError(`Item does not exist`, 404);
  }

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {
      item: {
        title: item.title || "unknown item",
        price: item.price || 0,
      },
    },
  };
}

const getItemBasicController = (
  req: Request,
  res: Response,
  next: Function
) => {
  return new Controller(req, res, next, getItemBasicLogic, {
    name: "GetItemBasicController",
    validPermissions: [PermissionsEnum.customer],
  }).run();
};

export { getItemController, getItemBasicController };

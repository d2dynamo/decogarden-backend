import type { Request, Response } from "express";

import Controller from "../controller";
import { PermissionsEnum } from "global/const";
import { listItems } from "modules/items";
import type { ListItemSorts } from "modules/items/types";

async function logic(this: Controller) {
  const filterData = await this.validateData(this.req.query, {
    title: { type: "string" },
    priceGte: { type: "number" },
    priceLte: { type: "number" },
  });

  const optionData = await this.validateData(this.req.query, {
    sort: { type: "sort" },
  });

  const pagination = this.getPagination();

  const result = await listItems(filterData, {
    pagination,
    sort: (optionData.sort as ListItemSorts) || { createdAt: 1 },
  });

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { items: result },
  };
}

const listItemsController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: "ListItemsController",
    validPermissions: [PermissionsEnum.inventory],
  }).run();
};

export default listItemsController;

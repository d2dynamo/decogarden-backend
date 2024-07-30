import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { getItem } from "../../modules/items/get";
import { stringToObjectId } from "../../modules/database/mongo";

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.locals = {
        error: true,
        code: 400,
        message: "bad id",
      };
      next();
      return;
    }

    const itemObjId = await stringToObjectId(id);

    if (!itemObjId) {
      res.locals = {
        errors: true,
        code: 400,
        message: "item id invalid",
      };
      next();
      return;
    }

    const item = await getItem(id);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: {
        item,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || "unknown client error",
      };
      next();
      return;
    }

    console.log("getItem controller: ", err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}

import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type { UpdateItem } from "../../global/interfaces/item";
import { updateItem } from "../../modules/items/update";
import { stringToObjectId } from "../../modules/database/mongo";

type UpdateItemErrors = { [K in keyof UpdateItem]?: string } & { id?: string };

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { id, title, description, price, properties, amountStorage } =
      req.body;

    const errors: UpdateItemErrors = {};

    const update: UpdateItem = {};

    if (title !== undefined) {
      if (typeof title !== "string") {
        errors.title = "must be string";
      } else if (title.length < 1 || title.length > 100) {
        errors.title = "must be between 1 and 100 characters long";
      } else {
        update.title = title;
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        errors.description = "must be string";
      } else if (description.length < 1 || description.length > 500) {
        errors.description = "must be between 1 and 500 characters long";
      } else {
        update.description = description;
      }
    }

    if (price !== undefined) {
      if (typeof price !== "number" || isNaN(price) || price < 0) {
        errors.price = "must be a non-negative number";
      } else {
        update.price = price;
      }
    }

    if (properties !== undefined) {
      if (typeof properties !== "object") {
        errors.properties = "must be an object if provided";
      } else {
        update.properties = properties;
      }
    }

    if (amountStorage !== undefined) {
      if (
        typeof amountStorage !== "number" ||
        isNaN(amountStorage) ||
        amountStorage < 0
      ) {
        errors.amountStorage = "must be a non-negative number if provided";
      } else {
        update.amountStorage = amountStorage;
      }
    }

    const itemObjId = await stringToObjectId(id);

    if (!itemObjId) {
      errors.id = "invalid item id";

      res.locals = {
        error: true,
        code: 400,
        message: "invalid item id",
        payload: { errors },
      };
      next();
      return;
    }

    await updateItem(itemObjId, update);

    res.locals = {
      error: false,
      message: "success",
      code: 200,
      payload: Object.keys(errors).length > 0 ? { errors } : {},
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

    console.log("updateItem controller", err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}

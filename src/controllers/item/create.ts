import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { addItem } from "../../modules/items/create";
import type { AddItem } from "../../global/interfaces/item";

type AddItemErrors = { [K in keyof AddItem]?: string };

// TODO: Write nicer data validator?

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { title, description, price, properties, amountStorage } = req.body;

    const errors: AddItemErrors = {};

    const newItem: AddItem = {
      title: ((t) => {
        if (!t) {
          errors.title = "missing required field";
          return "";
        }

        if (typeof t !== "string") {
          errors.title = "must be string";
          return "";
        }

        if (t.length < 1 || t.length > 100) {
          errors.title = "must be between 1 and 100 characters long";
          return "";
        }

        return t;
      })(title),

      description: ((d) => {
        if (!d) {
          errors.description = "missing value";
          return "";
        }

        if (typeof d !== "string") {
          errors.description = "must be string";
          return "";
        }

        if (d.length < 1 || d.length > 500) {
          errors.description = "must be between 1 and 500 characters long";
          return "";
        }

        return d;
      })(description),

      price: ((p) => {
        if (p === undefined || p === null) {
          errors.price = "missing required field";
          return 0;
        }

        if (typeof p !== "number" || isNaN(p) || p < 0) {
          errors.price = "must be a non-negative number";
          return 0;
        }

        return p;
      })(price),

      properties: ((prop) => {
        if (prop !== undefined && typeof prop !== "object") {
          errors.properties = "must be an object if provided";
          return {};
        }

        return prop;
      })(properties),

      amountStorage: ((amt) => {
        if (
          amt !== undefined &&
          (typeof amt !== "number" || isNaN(amt) || amt < 0)
        ) {
          errors.amountStorage = "must be a non-negative number if provided";
          return 0;
        }

        return amt;
      })(amountStorage),
    };

    // If there are validation errors, throw a UserError

    if (errors.title || errors.price) {
      res.locals = {
        error: true,
        code: 400,
        message: "missing required fields",
        payload: {
          errors,
        },
      };
      next();
      return;
    }

    await addItem(newItem);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload:
        Object.keys(errors).length > 0
          ? {
              errors,
            }
          : {},
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

    console.log("createItem ctrl:", err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}

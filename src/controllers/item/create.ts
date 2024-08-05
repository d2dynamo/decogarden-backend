import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { addItem } from "../../modules/items/create";
import type { AddItem } from "../../global/interfaces/item";
import { dataValidator } from "../../modules/validator";

type AddItemErrors = { [K in keyof AddItem]?: string | object };

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { title, description, price, properties, amountStorage, active } =
      req.body;

    const er: AddItemErrors = {};
    const newItem: any = {};

    if (
      await dataValidator(title, "title", "string", er, {
        required: true,
        minLength: 1,
        maxLength: 50,
      })
    )
      newItem.title = title;

    if (await dataValidator(price, "price", "number", er))
      newItem.price = price;

    if (
      await dataValidator(properties, "properties", "object", er, {
        maxProps: 8,
      })
    ) {
      const keys = Object.keys(properties);

      for (let i = 0; i > keys.length; i++) {
        const k = keys[i];
        const v = properties[k];

        er.properties = {};

        if (
          await dataValidator(v, `properties.${k}`, "string", er, {
            minLength: 1,
            maxLength: 50,
          })
        ) {
          continue;
        }
        if (
          await dataValidator(v, `properties.${k}`, "number", er, {
            min: 1,
          })
        ) {
          continue;
        }

        er.properties[k] = "must be a string or number";
        delete properties[k];
      }

      newItem.properties = properties;
    }

    if (await dataValidator(amountStorage, "amountStorage", "number", er))
      newItem.amountStorage = amountStorage;

    if (await dataValidator(active, "active", "boolean", er))
      newItem.active = active;

    if (
      await dataValidator(description, "description", "string", er, {
        minLength: 1,
        maxLength: 150,
      })
    )
      newItem.description = description;

    if (er.title || er.price) {
      res.locals = {
        error: true,
        code: 400,
        message: "missing required fields",
        payload: {
          errors: er,
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
        Object.keys(er).length > 0
          ? {
              errors: er,
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

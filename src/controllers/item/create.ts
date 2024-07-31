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
// const newItem: AddItem = {
//   title: ((t) => {
//     if (!t) {
//       errors.title = "missing required field";
//       return "";
//     }

//     if (typeof t !== "string") {
//       errors.title = "must be string";
//       return "";
//     }

//     if (t.length < 1 || t.length > 100) {
//       errors.title = "must be between 1 and 100 characters long";
//       return "";
//     }

//     return t;
//   })(title),

//   description: ((d) => {
//     if (!d) {
//       errors.description = "missing value";
//       return "";
//     }

//     if (typeof d !== "string") {
//       errors.description = "must be string";
//       return "";
//     }

//     if (d.length < 1 || d.length > 500) {
//       errors.description = "must be between 1 and 500 characters long";
//       return "";
//     }

//     return d;
//   })(description),

//   price: ((p) => {
//     if (p === undefined || p === null) {
//       errors.price = "missing required field";
//       return 0;
//     }

//     if (typeof p !== "number" || isNaN(p) || p < 0) {
//       errors.price = "must be a non-negative number";
//       return 0;
//     }

//     return p;
//   })(price),

//   properties: ((prop) => {
//     if (prop !== undefined && typeof prop !== "object") {
//       errors.properties = "must be an object if provided";
//       return {};
//     }

//     return prop;
//   })(properties),

//   amountStorage: ((amt) => {
//     if (
//       amt !== undefined &&
//       (typeof amt !== "number" || isNaN(amt) || amt < 0)
//     ) {
//       errors.amountStorage = "must be a non-negative number if provided";
//       return 0;
//     }

//     return amt;
//   })(amountStorage),

//   active: ((a) => {
//     if (typeof a !== "boolean") return false;

//     return a;
//   })(active),
// };

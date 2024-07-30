import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type {
  ListItemFilter,
  ListItemSorts,
} from "../../global/interfaces/item";
import { listItems } from "../../modules/items/get";
import type { ListOptions } from "../../global/interfaces/controller";

type ListItemsErrors = {
  [K in keyof ListItemFilter]?: string | object;
} & {
  [K in keyof ListOptions<ListItemSorts>]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { title, priceGte, priceLte, page, pageSize, limit, sort } = req.body;

    const errors: ListItemsErrors = {};

    const filter: ListItemFilter = {
      title: ((t) => {
        if (typeof t === "undefined") return;

        if (typeof t !== "string" || t.length < 1 || t.length > 100) {
          errors.title =
            "must be a string and contain between 1 and 100 characters";
        }

        return t;
      })(title),

      priceGte: ((p) => {
        if (typeof p === "undefined") return;

        if (typeof p !== "number" || isNaN(p) || p < 0) {
          errors.priceGte = "must be a number and not a negative number";
        }

        return p;
      })(priceGte),

      priceLte: ((p) => {
        if (typeof p === "undefined") return;

        if (typeof p !== "number" || isNaN(p) || p < 0) {
          errors.priceGte = "must be a number and not a negative number";
        }

        return p;
      })(priceLte),
    };

    const opts: ListOptions<ListItemSorts> = {
      page: ((p) => {
        if (typeof p === "undefined") return;

        if (typeof p !== "number" || isNaN(p) || p < 0) {
          errors.priceGte = "must be a number and not a negative number";
        }

        return p;
      })(page),

      pageSize: ((p) => {
        if (typeof p === "undefined") return;

        if (typeof p !== "number" || isNaN(p) || p < 0) {
          errors.priceGte = "must be a number and not a negative number";
        }

        return p;
      })(pageSize),

      limit: ((l) => {
        if (typeof l === "undefined") return;

        if (typeof l !== "number" || isNaN(l) || l < 0) {
          errors.priceGte = "must be a number and not a negative number";
        }

        return l;
      })(limit),

      sort: ((s) => {
        if (typeof s !== "object") return undefined;

        for (const key in s) {
          if (s.hasOwnProperty(key) && s[key] !== 1 && s[key] !== -1) {
            errors.sort = {
              ...(errors.sort as object),
              [key]: "invalid sort value, must be 1 or -1",
            };
          }
        }
        return s;
      })(sort),
    };

    const listResult = await listItems(filter, opts);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: listResult,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
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

    console.log(err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}

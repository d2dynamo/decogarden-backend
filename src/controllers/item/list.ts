import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type {
  ListItemFilter,
  ListItemSorts,
} from "../../global/interfaces/item";
import { listItems } from "../../modules/items/get";
import type { ListOptions } from "../../global/interfaces/controller";
import { dataValidator } from "../../modules/validator";

type ListItemsErrors = {
  [K in keyof ListItemFilter]?: string | object;
} & {
  [K in keyof ListOptions<ListItemSorts>]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { title, priceGte, priceLte, page, pageSize, limit, sort } = req.body;

    const errors: ListItemsErrors = {};

    const filter: ListItemFilter = {};

    if (
      await dataValidator(title, "title", "string", errors, {
        minLength: 1,
        maxLength: 50,
      })
    ) {
      filter.title = title;
    }

    if (await dataValidator(priceGte, "priceGte", "number", errors)) {
      filter.priceGte = priceGte;
    }

    if (await dataValidator(priceLte, "priceLte", "number", errors)) {
      filter.priceLte = priceLte;
    }

    const opts: any = {};

    if (
      await dataValidator(page, "page", "number", errors, { min: 1, max: 1000 })
    ) {
      opts.page = page;
    }

    if (
      await dataValidator(pageSize, "pageSize", "number", errors, {
        min: 1,
        max: 1000,
      })
    ) {
      opts.pageSize = pageSize;
    }

    if (await dataValidator(limit, "limit", "number", errors, { max: 1000 })) {
      opts.limit = limit;
    }

    if (await dataValidator(sort, "sort", "sort", errors)) {
      opts.sort = sort;
    }

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

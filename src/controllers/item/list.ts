import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import type { ListItemFilter, ListItemSorts } from '../../modules/items/types';
import type { ListOptions } from '../../global/interfaces/controller';
import { dataValidator } from '../../modules/validator';
import { listItems } from '../../modules/items';
import userHasPermission from '../../modules/userPermissions/get';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import logger from '../../modules/logger';

type ListItemsErrors = {
  [K in keyof ListItemFilter]?: string | object;
} & {
  [K in keyof ListOptions<ListItemSorts>]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  const errors: ListItemsErrors = {};

  try {
    const { title, priceGte, priceLte, page, pageSize, limit, sort } = req.body;
    const userId = req.user.id;

    if (!(await userHasPermission(userId, PermissionsEnum.customer))) {
      res.locals = {
        error: true,
        code: 403,
        message: 'forbidden',
      };
      next();
      return;
    }

    const filter: ListItemFilter = {};

    if (
      await dataValidator(title, 'title', 'string', errors, {
        minLength: 1,
        maxLength: 50,
      })
    ) {
      filter.title = title;
    }

    if (await dataValidator(priceGte, 'priceGte', 'number', errors)) {
      filter.priceGte = priceGte;
    }

    if (await dataValidator(priceLte, 'priceLte', 'number', errors)) {
      filter.priceLte = priceLte;
    }

    const opts: any = {};

    if (
      await dataValidator(page, 'page', 'number', errors, { min: 1, max: 1000 })
    ) {
      opts.page = page;
    }

    if (
      await dataValidator(pageSize, 'pageSize', 'number', errors, {
        min: 1,
        max: 1000,
      })
    ) {
      opts.pageSize = pageSize;
    }

    if (await dataValidator(limit, 'limit', 'number', errors, { max: 1000 })) {
      opts.limit = limit;
    }

    if (await dataValidator(sort, 'sort', 'sort', errors)) {
      opts.sort = sort;
    }

    const listResult = await listItems(filter, opts);

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {
        items: listResult,
        errors: errors,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
      };
      next();
      return;
    }

    logger.error(2, 'failed to list items', {
      userId: req.user?.id,
      error: err,
      headers: req.headers,
      body: req.body,
    });

    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
    };
    next();
  }
}

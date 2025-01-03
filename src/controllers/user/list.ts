import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import type { ListUserFilter, ListUserSorts } from '../../modules/users/types';
import userHasPermission from '../../modules/userPermissions/get';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import { dataValidator } from '../../modules/validator';
import type { ListOptions } from '../../global/interfaces/controller';
import listUsers from '../../modules/users/list';
import logger from '../../modules/logger';

type ListUserErrors = { [K in keyof ListUserFilter]?: string | object } & {
  [K in keyof ListOptions<ListUserSorts>]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  const errs: ListUserErrors = {};
  try {
    const userId = req.user.id;
    const { userName, email, page, pageSize, limit, sort } = req.body;

    if (!userId || !(await userHasPermission(userId, PermissionsEnum.sales))) {
      res.locals = {
        error: true,
        code: 403,
        message: 'forbidden',
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    const filter: ListUserFilter = {};

    if (
      await dataValidator(userName, 'userName', 'string', errs, {
        minLength: 1,
        maxLength: 50,
      })
    ) {
      filter.userName = userName;
    }

    if (
      await dataValidator(email, 'email', 'string', errs, {
        minLength: 1,
        maxLength: 50,
      })
    ) {
      filter.email = email;
    }

    const opts: any = {};

    if (
      await dataValidator(page, 'page', 'number', errs, { min: 1, max: 1000 })
    ) {
      opts.page = page;
    }

    if (
      await dataValidator(pageSize, 'pageSize', 'number', errs, {
        min: 1,
        max: 100,
      })
    ) {
      opts.pageSize = pageSize;
    }

    if (await dataValidator(limit, 'limit', 'number', errs, { max: 1000 })) {
      opts.limit = limit;
    }

    if (
      await dataValidator(sort, 'sort', 'string', errs, {
        minLength: 1,
        maxLength: 50,
      })
    ) {
      opts.sort = sort;
    }

    const result = await listUsers(filter, opts);

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {
        data: result,
        errors: errs,
      },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
        payload: {
          errors: errs,
        },
      };
      next();
      return;
    }

    logger.error(2, 'failed to list users', {
      userId: req.user?.id,
      error: err,
      headers: req.headers,
      body: req.body,
    });

    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
      payload: {
        errors: errs,
      },
    };
    next();
  }
}

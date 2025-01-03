import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import { getItem } from '../../modules/items';
import { stringToObjectId } from '../../modules/database/mongo';
import userHasPermission from '../../modules/userPermissions/get';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import logger from '../../modules/logger';

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { id } = req.params;
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

    if (!id || typeof id !== 'string') {
      res.locals = {
        error: true,
        code: 400,
        message: 'item id invalid',
      };
      next();
      return;
    }

    const itemObjId = await stringToObjectId(id);

    if (!itemObjId) {
      res.locals = {
        error: true,
        code: 400,
        message: 'item id invalid',
      };
      next();
      return;
    }

    const item = await getItem(id);

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
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
        message: err.message || 'unknown client error',
      };
      next();
      return;
    }

    logger.error(2, 'failed to get item', {
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

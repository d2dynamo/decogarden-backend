import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import type { SetUserPermission } from '../../modules/userPermissions/types';
import { dataValidator } from '../../modules/validator';
import userHasPermission from '../../modules/userPermissions/get';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import setUserPermission from '../../modules/userPermissions/create';
import { stringToObjectId } from '../../modules/database/mongo';
import logger from '../../modules/logger';

type AddUserPermissionErrors = {
  [K in keyof SetUserPermission]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  const errs: AddUserPermissionErrors = {};

  try {
    const { userId, permissionId, active } = req.body;
    const tokenUserId = req.user.id;

    if (!(await userHasPermission(tokenUserId, PermissionsEnum.admin))) {
      res.locals = {
        error: true,
        code: 403,
        message: 'forbidden',
      };
      next();
      return;
    }

    const newUserPermission: any = {};

    if (
      await dataValidator(userId, 'userId', 'string', errs, { required: true })
    ) {
      const uObjId = await stringToObjectId(userId);
      if (!uObjId) {
        errs.userId = 'invalid userId';
      }

      newUserPermission.userId = uObjId;
    }

    if (
      await dataValidator(permissionId, 'permissionId', 'string', errs, {
        required: true,
      })
    ) {
      const pObjId = await stringToObjectId(permissionId);
      if (!pObjId) {
        errs.permissionId = 'invalid permissionId';
      }

      newUserPermission.permissionId = pObjId;
    }

    if (await dataValidator(active, 'active', 'boolean', errs)) {
      newUserPermission.active = active;
    }

    if (Object.keys(errs).length) {
      res.locals = {
        error: true,
        code: 400,
        message: 'invalid data',
        payload: { errors: errs },
      };
      next();
      return;
    }

    await setUserPermission({
      userId: newUserPermission.userId,
      permissionId: newUserPermission.permissionId,
      active: newUserPermission.active,
    });

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {},
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
        payload:
          Object.keys(errs).length > 0
            ? {
                errors: errs,
              }
            : {},
      };
      next();
      return;
    }

    logger.error(5, 'failed to create user permission', {
      userId: req.user?.id,
      error: err,
      headers: req.headers,
      body: req.body,
    });

    res.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
      payload:
        Object.keys(errs).length > 0
          ? {
              errors: errs,
            }
          : {},
    };
    next();
  }
}

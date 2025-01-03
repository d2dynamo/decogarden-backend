import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import type { UpdateItem } from '../../modules/items/types';
import { updateItem } from '../../modules/items';
import { stringToObjectId } from '../../modules/database/mongo';
import { dataValidator } from '../../modules/validator';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import userHasPermission from '../../modules/userPermissions/get';
import logger from '../../modules/logger';

type UpdateItemErrors = { [K in keyof UpdateItem]?: string | object } & {
  id?: string;
};

export default async function (req: Request, res: Response, next: Function) {
  try {
    const { id, title, description, price, properties, active, amountStorage } =
      req.body;
    const userId = req.user.id;

    if (!(await userHasPermission(userId, PermissionsEnum.inventory))) {
      res.locals = {
        error: true,
        code: 403,
        message: 'forbidden',
      };
      next();
      return;
    }

    const errors: UpdateItemErrors = {};

    const update: UpdateItem = {};

    if (await dataValidator(title, 'title', 'string', errors)) {
      update.title = title;
    }

    if (await dataValidator(description, 'description', 'string', errors)) {
      update.description = description;
    }

    if (await dataValidator(price, 'price', 'number', errors)) {
      update.price = price;
    }

    if (await dataValidator(amountStorage, 'amountStorage', 'number', errors)) {
      update.amountStorage = amountStorage;
    }

    if (await dataValidator(active, 'active', 'boolean', errors)) {
      update.active = active;
    }

    if (
      await dataValidator(properties, 'properties', 'object', errors, {
        maxProps: 8,
      })
    ) {
      const keys = Object.keys(properties);

      errors.properties = {};
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = properties[k];

        if (
          await dataValidator(v, `properties.${k}`, 'string', errors, {
            minLength: 1,
            maxLength: 50,
          })
        ) {
          continue;
        }
        delete errors[`properties.${k}`];

        if (
          await dataValidator(v, `properties.${k}`, 'number', errors, {
            min: 1,
          })
        ) {
          continue;
        }
        delete errors[`properties.${k}`];

        errors.properties[k] = 'must be a string or number';
        delete properties[k];
      }

      if (Object.keys(errors.properties).length == 0) delete errors.properties;

      update.properties = properties;
    }

    // We letting the validator run first before checking if the id is even valid so that we can return an errors object with info on data validation errors.

    const itemObjId = await stringToObjectId(id);

    if (!itemObjId) {
      errors.id = 'invalid item id';

      res.locals = {
        error: true,
        code: 400,
        message: 'invalid item id',
        payload: { errors },
      };
      next();
      return;
    }

    await updateItem(itemObjId, update);

    res.locals = {
      error: false,
      message: 'success',
      code: 200,
      payload: Object.keys(errors).length > 0 ? { errors } : {},
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

    logger.error(2, 'failed to update item', {
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

import type { Request, Response } from 'express';
import { UserError } from '../../util/error';
import { addItem } from '../../modules/items';
import { dataValidator } from '../../modules/validator';
import type { AddItem } from '../../modules/items/types';
import userHasPermission from '../../modules/userPermissions/get';
import { PermissionsEnum } from '../../global/interfaces/permissions';
import logger from '../../modules/logger';

type AddItemErrors = { [K in keyof AddItem]?: string | object };

export default async function (req: Request, res: Response, next: Function) {
  const errs: AddItemErrors = {};

  try {
    const { title, description, price, properties, amountStorage, active } =
      req.body;
    const userId = req.user.id;

    const newItem: any = {};

    if (!(await userHasPermission(userId, PermissionsEnum.inventory))) {
      res.locals = {
        error: true,
        code: 403,
        message: 'forbidden',
      };
      next();
      return;
    }

    if (
      await dataValidator(title, 'title', 'string', errs, {
        required: true,
        minLength: 1,
        maxLength: 50,
      })
    )
      newItem.title = title;

    if (await dataValidator(price, 'price', 'number', errs, { required: true }))
      newItem.price = price;

    if (
      await dataValidator(properties, 'properties', 'object', errs, {
        maxProps: 8,
      })
    ) {
      const keys = Object.keys(properties);

      errs.properties = {};
      for (let i = 0; i > keys.length; i++) {
        const k = keys[i];
        const v = properties[k];

        if (
          await dataValidator(v, `properties.${k}`, 'string', errs, {
            minLength: 1,
            maxLength: 50,
          })
        ) {
          continue;
        }
        delete errs[`properties.${k}`];

        if (
          await dataValidator(v, `properties.${k}`, 'number', errs, {
            min: 1,
          })
        ) {
          continue;
        }
        delete errs[`properties.${k}`];

        errs.properties[k] = 'must be a string or number';
        delete properties[k];
      }
      if (Object.keys(errs.properties).length == 0) delete errs.properties;

      newItem.properties = properties;
    }

    if (await dataValidator(amountStorage, 'amountStorage', 'number', errs))
      newItem.amountStorage = amountStorage;

    if (await dataValidator(active, 'active', 'boolean', errs))
      newItem.active = active;

    if (
      await dataValidator(description, 'description', 'string', errs, {
        minLength: 1,
        maxLength: 150,
      })
    )
      newItem.description = description;

    if (errs.title || errs.price) {
      throw new UserError('missing required fields', 400);
    }

    const insId = await addItem(newItem);

    res.locals = {
      error: false,
      code: 200,
      message: 'success',
      payload: {
        insertedId: insId,
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

    logger.error(2, 'failed to add item', {
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

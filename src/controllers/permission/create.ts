import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type { AddPermission } from "../../modules/permissions/types";
import { dataValidator } from "../../modules/validator";
import { createPermission } from "../../modules/permissions";

type AddPermissionErrors = { [K in keyof AddPermission]?: string | object };

export default async function (req: Request, res: Response, next: Function) {
  const errs: AddPermissionErrors = {};

  try {
    const { name, active } = req.body;

    const newPermission: any = {};

    if (
      await dataValidator(name, "name", "string", errs, {
        required: true,
        minLength: 1,
        maxLength: 50,
      })
    )
      newPermission.name = name;

    if (await dataValidator(active, "active", "boolean", errs))
      newPermission.active = active;

    if (Object.keys(errs).length) {
      res.locals = {
        error: true,
        code: 400,
        message: "invalid data",
        payload: { errors: errs },
      };
      next();
      return;
    }

    const result = await createPermission(newPermission);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: { permissionId: result },
    };
    next();
  } catch (err) {
    if (err instanceof UserError) {
      res.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || "unknown client error",
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

    console.log("createPermission ctrl:", err);

    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
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

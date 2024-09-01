import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type { AddUserPermission } from "../../modules/userPermissions/types";
import { dataValidator } from "../../modules/validator";

type AddUserPermissionErrors = {
  [K in keyof AddUserPermission]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  const errs: AddUserPermissionErrors = {};

  try {
    const { userId, permissionId, active } = req.body;

    const newUserPermission: any = {};

    if (
      await dataValidator(userId, "userId", "string", errs, { required: true })
    ) {
      newUserPermission.userId = userId;
    }

    if (
      await dataValidator(permissionId, "permissionId", "string", errs, {
        required: true,
      })
    ) {
      newUserPermission.permissionId = permissionId;
    }

    if (await dataValidator(active, "active", "boolean", errs)) {
      newUserPermission.active = active;
    }

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

    console.log("createUserPermission ctrl:", err);

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

import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import { stringToObjectId } from "../../modules/database/mongo";
import userHasPermission from "../../modules/userPermissions/get";
import listUserPermissions from "../../modules/userPermissions/list";
import { PermissionsEnum } from "../../global/interfaces/permissions";

export default async function (req: Request, res: Response, next: Function) {
  const errs = {};

  try {
    const { id } = req.params;
    const tokenUserId = req.user.id;

    if (
      tokenUserId !== id &&
      !(await userHasPermission(tokenUserId, PermissionsEnum.admin))
    ) {
      res.locals = {
        error: true,
        code: 403,
        message: "forbidden",
      };
      next();
      return;
    }

    if (!id || typeof id !== "string") {
      res.locals = {
        error: true,
        code: 400,
        message: "missing or invalid user id",
      };
      next();
      return;
    }

    const userObjId = await stringToObjectId(id);

    if (!userObjId) {
      res.locals = {
        error: true,
        code: 400,
        message: "user id invalid",
      };
      next();
      return;
    }

    const userPermissions = await listUserPermissions(id);

    res.locals = {
      error: false,
      code: 200,
      message: "success",
      payload: {
        data: userPermissions,
      },
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

    console.log("controller:", err);

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

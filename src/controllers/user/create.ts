import type { Request, Response } from "express";
import { UserError } from "../../util/error";
import type { SetUser } from "../../modules/users/types";
import { dataValidator } from "../../modules/validator";
import createUser from "../../modules/users/create";

type AddUserErrors = {
  [K in keyof SetUser]?: string | object;
};

export default async function (req: Request, res: Response, next: Function) {
  const errs: AddUserErrors = {};
  try {
    const { userName, password, email, phone } = req.body;

    const newUser: any = {};

    if (
      await dataValidator(userName, "userName", "string", errs, {
        required: true,
        minLength: 1,
        maxLength: 50,
      })
    ) {
      newUser.userName = userName;
    }

    if (
      await dataValidator(password, "password", "string", errs, {
        required: true,
        minLength: 8,
        maxLength: 50,
      })
    ) {
      newUser.password = password;
    }

    if (
      await dataValidator(email, "email", "string", errs, {
        required: true,
        minLength: 5,
        maxLength: 50,
      })
    ) {
      newUser.email = email;
    }

    if (
      await dataValidator(phone, "phone", "string", errs, {
        minLength: 10,
        maxLength: 15,
      })
    ) {
      newUser.phone = phone;
    }

    if (errs.userName || errs.password || errs.email) {
      res.locals = {
        error: true,
        code: 400,
        message: "invalid user data",
        payload: {
          errors: errs,
        },
      };
    }

    await createUser(userName, password, { email, phone });

    res.locals = {
      error: false,
      code: 200,
      message: "user created",
      payload: { errors: errs },
    };
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

import type { Request, Response } from "express";

import Controller from "../controller";
import { createUser } from "../../modules/users";

async function logic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    userName: { type: "string", options: { required: true } },
    email: { type: "string", options: { required: true } },
    password: { type: "string", options: { required: true } },
    phone: { type: "string" },
  });

  const result = await createUser(data);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: { id: result },
  };
}

const createUserController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, logic, {
    name: "CreateUserController",
    errorLevel: 2,
  }).run();
};

export default createUserController;

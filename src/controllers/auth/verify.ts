import type { Request, Response } from "express";

import Controller from "../controller";
import { verifyUser } from "modules/users/verify";

async function verifyUserLogic(this: Controller) {
  const data = await this.validateData(this.req.body, {
    code: {
      type: "string",
      options: { required: true },
    },
  });

  await verifyUser(data.code);

  this.locals = {
    error: false,
    code: 200,
    message: "success",
    payload: {},
  };
}

const verifyUserController = (req: Request, res: Response, next: Function) => {
  return new Controller(req, res, next, verifyUserLogic, {
    name: "verifyUser",
    errorLevel: 2,
  }).run();
};

export default verifyUserController;

import type { Request, Response } from "express";
import { generateToken } from "../../modules/token";

export async function loginUserWithEmail(
  req: Request,
  res: Response,
  next: Function
) {
  try {
    const user = req.user;

    if (!user) {
      throw new Error(`No user found in request`);
    }

    const access_token = await generateToken({
      userId: user.id,
      email: user.email,
      expiration: "4h",
      type: "access_token",
    });

    const refresh_token = await generateToken({
      userId: user.id,
      email: user.email,
      expiration: "4h",
      type: "refresh_token",
    });

    res.locals = {
      error: true,
      code: 200,
      message: "success",
      payload: {
        access_token,
        refresh_token,
      },
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}

import type { Request, Response } from "express";

export async function send(req: Request, res: Response) {
  if (res.locals.redirect) {
    let url = "";

    url = `${res.locals.redirect}?error=${res.locals.error}&message=${res.locals.message}`;

    if (res.locals.payload.accessToken && res.locals.payload.refreshToken) {
      url = `${res.locals.redirect}?accessToken=${res.locals.payload.accessToken}&refreshToken=${res.locals.payload.refreshToken}`;
    }

    res.redirect(url);
    return;
  }

  if (!res.locals.error && !res.locals.payload && !res.locals.message) {
    res.status(404).json({
      error: true,
      message: "Not found",
      payload: {},
    });
    return;
  }

  // <----Default response---->
  const resData: any = {
    error: res.locals.error || false,
    message: res.locals.message || "",
    payload: res.locals.payload || {},
  };
  let resCode = res.locals.code || 200;
  if (typeof resCode !== "number") resCode = 200;
  // <------------------------>
  res.status(resCode).json(resData);
}

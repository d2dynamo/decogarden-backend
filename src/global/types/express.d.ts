import "express";
import type { ITokenUser } from "../interfaces/token";

declare namespace Express {
  export interface Request {
    user: ITokenUser;
  }
  export interface Response {
    locals: {
      error: boolean;
    };
  }
}

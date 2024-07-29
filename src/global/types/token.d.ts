import { JWTPayload } from "jose";

declare module "jose" {
  interface JWTPayload {
    /** Subject email */
    sub_email?: string;
  }
}

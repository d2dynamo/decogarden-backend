import { Strategy } from "passport-http-bearer";
import { validateToken } from "../token";
import type { ITokenUser } from "../../global/interfaces/token";

const bearerStrategy = new Strategy(
  { passReqToCallback: true },
  async (req, token: string, done: Function) => {
    if (!token) return done(Error("Missing token"), null);

    try {
      const validateResult = await validateToken(token, "access_token");

      if (!validateResult.verified) {
        return done({ code: 406, message: "invalid token." }, false);
      }

      const payload = validateResult.jwt.payload;

      if (!payload.sub || !payload.sub_email) {
        return done({ code: 406, message: "token missing user" });
      }

      const user: ITokenUser = {
        id: payload.sub,
        email: payload.sub_email,
      };

      req.user = user;

      return done(null, user);
    } catch (err) {
      console.log(err);

      return done({ code: 500, message: "internal server error" });
    }
  }
);

export default bearerStrategy;

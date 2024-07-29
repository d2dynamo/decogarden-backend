import passport from "passport";
import type { ITokenUser } from "../../global/interfaces/token";
import connectCollection from "../database/mongo";

import localStrategy from "./localStrategy";
import bearerStrategy from "./bearerStrategy";

passport.serializeUser((user: any, done) => done(null, user));

passport.deserializeUser(async (res: any, done) => {
  try {
    const coll = await connectCollection("users");

    const userDoc = await coll.findOne(
      { _id: res._id },
      { projection: { _id: 1, email: 1 } }
    );

    if (!userDoc || !userDoc._id) return done(null, false);

    const user: ITokenUser = {
      id: userDoc._id.toString(),
      email: userDoc.email.toLowerCase(),
    };

    return done(null, user);
  } catch (error: any) {
    console.log(error);
    done(error, null);
  }
});

passport.use(localStrategy);
passport.use(bearerStrategy);

export default passport;

import { Strategy as LocalStrategy } from "passport-local";
import connectCollection from "../database/mongo";

const localStrategy = new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const coll = await connectCollection("users");

      const userDoc = await coll.findOneAndUpdate(
        { email: email.toLocaleLowerCase() },
        {
          $set: { lastLoginAttempt: new Date() },
        },
        {
          projection: {
            _id: 1,
            email: 1,
            salt: 1,
            hash: 1,
          },
        }
      );

      if (!userDoc) {
        return done(null, false, {
          message: "user not found",
        });
      }

      if (!userDoc.hash) {
        return done(null, false, {
          message: "user has no password set",
        });
      }

      if (!(await Bun.password.verify(password, userDoc.hash, "argon2id"))) {
        return done(null, false, {
          message: "incorrect password",
        });
      }

      await coll.updateOne(
        { email: email },
        { $set: { lastLogin: new Date() } }
      );

      return done(null, { id: userDoc._id, email: email });
    } catch (err) {
      console.log(err);
      return done({ code: 500, message: "internal server error" });
    }
  }
);

export default localStrategy;

import { UserError } from "../../util/error";
import connectCollection from "../database/mongo";

// TODO: email verification
export default async function createUser(email: string, password: string) {
  const coll = await connectCollection("users");

  const hash = await Bun.password.hash(password, {
    algorithm: "argon2id",
    timeCost: 2,
    memoryCost: 3,
  });

  const result = await coll.updateOne(
    { email: email },
    {
      $setOnInsert: {
        email: email,
        hash: hash,
        emailVerify: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
    }
  );

  if (!result.upsertedId) {
    throw new UserError(`email already used`);
  }

  // create simple verify token
  // store verify token in redis for 7 days
  // send email verify

  return true;
}

export async function resendVerifyEmail(email: string) {
  // check if emailVerify false
  // check if token exists in redis
  // replace token if exists in redis
  // send email verify
  return true;
}

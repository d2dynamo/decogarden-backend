import { UserError } from "../../util/error";
import generateSimpleToken from "../../util/simpleToken";
import connectCollection from "../database/mongo";
import { redisClient } from "../database/redis";
import SgMailer from "../mailer";
import { SendgridTemplates } from "../mailer/templates";

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
    throw new UserError(`email already used`, 409);
  }

  const redis = await redisClient();

  const verifyToken = generateSimpleToken();

  await redis.set(`verify:${verifyToken}`, email, "EX", 60 * 60 * 24 * 1);

  const sgMailer = SgMailer.getInstance();
  await sgMailer.sendTemplateEmail(email, SendgridTemplates.verifyEmail, {
    verification_code: verifyToken,
  });

  return true;
}

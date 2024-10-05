import { UserError } from "../../util/error";
import generateSimpleToken from "../../util/simpleToken";
import connectCollection from "../database/mongo";
import { redisClient } from "../database/redis";
import SgMailer from "../mailer";
import { SendgridTemplates } from "../mailer/templates";

interface CreateUserOpts {
  email?: string;
  phone?: string;
  auth?: boolean;
}

export default async function createUser(
  userName: string,
  password: string,
  opts: CreateUserOpts
) {
  const coll = await connectCollection("users");

  const hash = await Bun.password.hash(password, {
    algorithm: "argon2id",
    timeCost: 2,
    memoryCost: 3,
  });

  const set = {
    userName: userName,
    hash: hash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const redis = await redisClient();

  if (opts.email) {
    set["email"] = opts.email;
    set["emailVerified"] = false;

    const verifyToken = generateSimpleToken();

    await redis.set(
      `verify:${verifyToken}`,
      opts.email,
      "EX",
      60 * 60 * 24 * 1
    );

    const sgMailer = SgMailer.getInstance();
    await sgMailer.sendTemplateEmail(
      opts.email,
      SendgridTemplates.verifyEmail,
      {
        verification_code: verifyToken,
      }
    );
  }

  if (opts.phone) {
    set["phone"] = opts.phone;
    set["phoneVerified"] = false;

    // when twilio set up add phone nr verification
  }

  if (opts.auth) {
    set["auth"] = opts.auth;
  }

  const result = await coll.updateOne(
    { userName: userName },
    {
      $setOnInsert: set,
    },
    {
      upsert: true,
    }
  );

  if (!result.upsertedId) {
    throw new UserError(`email already used`, 409);
  }

  return true;
}

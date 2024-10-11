import { UserError } from "../../util/error";
import genSimpleKey from "../../util/simpleToken";
import connectCollection from "../database/mongo";
import { redisClient } from "../database/redis";
import SgMailer from "../mailer";
import { SendgridTemplates } from "../mailer/templates";

interface CreateUserOpts {
  email?: string;
  phone?: string;
}

export default async function createUser(
  userName: string,
  password: string,
  opts: CreateUserOpts
) {
  if (!opts.email) {
    // setup twilio and require phone
    throw new UserError(`email required`, 400);
  }

  const coll = await connectCollection("users");

  const checkUsed = await coll.findOne({
    $or: [{ email: opts.email }, { userName: userName }],
  });

  if (checkUsed) {
    throw new UserError(`email or username already used`, 409);
  }

  const hash = await Bun.password.hash(password, {
    algorithm: "argon2id",
    timeCost: 2,
    memoryCost: 3,
  });

  const set = {
    email: opts.email,
    userName: userName,
    hash: hash,
    emailVerify: false,
    ttl: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const redis = await redisClient();

  const verifyToken = genSimpleKey();

  await redis.set(`verify:${verifyToken}`, opts.email, "EX", 60 * 60 * 24 * 1);

  const sgMailer = SgMailer.getInstance();
  await sgMailer.sendTemplateEmail(opts.email, SendgridTemplates.verifyEmail, {
    verification_code: verifyToken,
  });

  if (opts.phone) {
    set["phone"] = opts.phone;
    set["phoneVerified"] = false;

    // when twilio set up add phone nr verification
  }

  const result = await coll.insertOne(set);

  if (!result.insertedId) {
    throw new Error("failed to create user");
  }

  return true;
}

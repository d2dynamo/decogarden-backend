import { UserError } from "../../util/error";
import genSimpleKey from "../../util/simpleToken";
import connectCollection from "../database/mongo";
import { redisClient } from "../database/redis";
import SgMailer from "../mailer";
import { SendgridTemplates } from "../mailer/templates";

export default async function verifyUser(
  token: string,
  byEmail = false,
  byPhone = false
): Promise<boolean> {
  const redis = await redisClient();

  const coll = await connectCollection("users");

  if (byEmail) {
    const email = await redis.get(`verify:${token}`);
    if (!email) {
      throw new UserError("Token expired", 400);
    }

    const result = await coll.updateOne(
      { email: email },
      {
        $set: {
          emailVerify: true,
          updatedAt: new Date(),
        },
        $unset: {
          ttl: "",
        },
      }
    );

    if (!result.matchedCount) {
      throw new UserError("User not found", 404);
    }

    await redis.del(`verify:${token}`);
  }

  if (byPhone) {
    // when twilio set up. todo
  }

  return true;
}

export async function resendVerifyEmail(email: string) {
  const coll = await connectCollection("users");

  const user = await coll.findOne({ email });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  if (user.emailVerify) {
    throw new UserError("Email already verified", 400);
  }

  const redis = await redisClient();

  const verifyToken = genSimpleKey();

  await redis.set(`verify:${verifyToken}`, email, "EX", 60 * 60 * 24 * 1);

  const sgMailer = SgMailer.getInstance();
  await sgMailer.sendTemplateEmail(email, SendgridTemplates.verifyEmail, {
    verification_code: verifyToken,
  });

  return true;
}

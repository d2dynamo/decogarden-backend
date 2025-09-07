import { userLayer } from "modules/database";
import { PermissionsEnum } from "global/const";
import { UserError } from "util/error";
import genSimpleKey from "util/simpleToken";
import { redisClient } from "../database/redis";
import SgMailer from "../mailer";
import { SendgridTemplates } from "../mailer/templates";
import setUserPermission from "../userPermissions/set";
import type { FResendVerify, FVerifyUser } from "./types";

// TODO when twilio set up add phone nr verification
const verifyUser: FVerifyUser = async (token: string) => {
  const redis = await redisClient();

  const userId = await redis.get(`verify:${token}`);
  if (!userId) {
    throw new UserError("Token expired", 400);
  }

  const result = await userLayer.update(userId, {
    $set: {
      emailVerify: true,
      updatedAt: new Date(),
    },
    $unset: {
      ttl: "",
    },
  });

  if (!result.matchedCount) {
    throw new UserError("User not found", 404);
  }

  await setUserPermission({
    userId: userId,
    permissionId: PermissionsEnum.customer,
    active: true,
  });

  await redis.del(`verify:${token}`);

  return true;
};

const resendVerify: FResendVerify = async (input) => {
  if (!input.email && !input.phone) {
    throw new UserError("Invalid option", 400);
  }

  const user = await userLayer.get(input.userId);

  if (!user) {
    throw new UserError("User not found", 404);
  }

  const redis = await redisClient();

  const verifyToken = genSimpleKey();

  if (input.email) {
    if (user.emailVerify) {
      throw new UserError("Email already verified", 400);
    }

    await redis.set(
      `verify:${verifyToken}`,
      input.email,
      "EX",
      60 * 60 * 24 * 1
    );

    const sgMailer = SgMailer.getInstance();
    await sgMailer.sendTemplateEmail(
      input.email,
      SendgridTemplates.verifyEmail,
      {
        verification_code: verifyToken,
      }
    );
  }

  if (input.phone) {
    // when twilio set up add phone nr verification
  }

  return;
};

export { verifyUser, resendVerify };

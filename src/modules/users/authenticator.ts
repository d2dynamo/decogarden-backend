import type { ObjectId } from "mongodb";

import { UserError } from "util/error";
import { generateBase32Secret, totp } from "../totp";
import { redisClient } from "../database/redis";
import type {
  FDisable2fa,
  FEnable2fa,
  FGenerate2fa,
  FVerify2fa,
} from "./types";
import { userLayer } from "modules/database";

const generate2fa: FGenerate2fa = async (
  userId: ObjectId | string,
  password: string
) => {
  const user = await userLayer.get(userId, {
    projection: { hash: 1 },
  });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  if (!user.hash) {
    throw new UserError("User has no password", 400);
  }

  const validPassword = await Bun.password.verify(user.hash, password);

  if (!validPassword) {
    throw new UserError("Invalid password", 400);
  }

  const newSecret = generateBase32Secret();

  const redis = await redisClient();

  await redis.set(`2fa:${String(userId)}`, newSecret, "EX", 60 * 5);

  return newSecret;
};

const enable2fa: FEnable2fa = async (
  userId: ObjectId | string,
  code: string
) => {
  const user = userLayer.get(userId, {
    projection: { _id: 1, authSecret: 1 },
  });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  const redis = await redisClient();

  const secret = await redis.get(`2fa:${String(userId)}`);

  if (!secret) {
    throw new UserError("Period expired", 400);
  }

  const validCodes = await totp(secret, 4, 1);

  if (!validCodes.includes(code)) {
    throw new UserError("Invalid code", 400);
  }

  const result = await userLayer.update(userId, {
    $set: {
      authSecret: secret,
      updatedAt: new Date(),
    },
  });

  if (!result.modifiedCount) {
    throw new Error("Failed to enable 2fa");
  }

  return true;
};

const verify2fa: FVerify2fa = async (
  userId: ObjectId | string,
  code: string
) => {
  const user = await userLayer.get(userId, {
    projection: { _id: 1, authSecret: 1 },
  });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  const validCodes = await totp(user.authSecret, 2, 1);

  if (!validCodes.includes(code)) {
    throw new UserError("Invalid code", 400);
  }

  return true;
};

const disable2fa: FDisable2fa = async (
  userId: ObjectId | string,
  password: string
) => {
  const user = await userLayer.get(userId, {
    projection: { _id: 1, hash: 1 },
  });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  if (!user.authSecret) {
    throw new UserError("2fa not enabled", 400);
  }

  if (!user.hash) {
    throw new UserError("User has no password", 400);
  }

  const validPassword = await Bun.password.verify(user.hash, password);

  if (!validPassword) {
    throw new UserError("Invalid password", 400);
  }

  const result = await userLayer.update(userId, {
    $unset: {
      authSecret: "",
    },
  });

  if (!result.modifiedCount) {
    throw new Error("Failed to disable 2fa");
  }

  return true;
};

export { generate2fa, enable2fa, verify2fa, disable2fa };

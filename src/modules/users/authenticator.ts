import type { ObjectId } from "mongodb";
import { UserError } from "../../util/error";
import connectCollection from "../database/mongo";
import { generateBase32Secret, totp } from "../totp";

export async function generate2fa(userId: ObjectId, password: string) {
  const coll = await connectCollection("users");

  const user = await coll.findOne({ _id: userId });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  const validPassword = await Bun.password.verify(user.hash, password);

  if (!validPassword) {
    throw new UserError("Invalid password", 400);
  }

  const newSecret = generateBase32Secret();

  const updateResult = await coll.updateOne(
    { _id: userId },
    {
      $set: {
        authSecret: newSecret,
      },
    }
  );

  if (!updateResult.modifiedCount) {
    throw new Error("Failed to update user");
  }

  return newSecret;
}

export async function verify2fa(userId: ObjectId, token: string) {
  const coll = await connectCollection("users");

  const user = await coll.findOne({ _id: userId });

  if (!user) {
    throw new UserError("User not found", 404);
  }

  const validToken = await totp(user.authSecret, 2, 1);

  if (!validToken.includes(token)) {
    throw new UserError("Invalid token", 400);
  }

  return true;
}

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

  return true;
}

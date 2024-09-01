import type { ObjectId } from "mongodb";
import getUser from "../users/get";
import connectCollection from "../database/mongo";
import type { AddUserPermission } from "./types";

export default async function addUserPermission(add: AddUserPermission) {
  await getUser(add.userId);

  const coll = await connectCollection("userPermissions");

  const result = await coll.updateOne(
    {
      userId: add.userId,
      permissionId: add.permissionId,
    },
    {
      $setOnInsert: {
        createdAt: new Date(),
      },
      $set: {
        active: add.active ?? true,
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
    }
  );

  if (result.matchedCount && !result.upsertedCount) {
    throw new Error("failed to create permission");
  }

  return true;
}

import type { ObjectId } from "mongodb";
import getUser from "../users/get";
import connectCollection from "../database/mongo";

export default async function addUserPermission(
  userId: ObjectId,
  permissionId: ObjectId
) {
  await getUser(userId);

  const coll = await connectCollection("userPermissions");

  const result = await coll.updateOne(
    {
      userId: userId,
      permissionId: permissionId,
    },
    {
      $setOnInsert: {
        createdAt: new Date(),
      },
      $set: {
        active: true,
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

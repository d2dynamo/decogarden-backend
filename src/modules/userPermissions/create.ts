import connectCollection from "../database/mongo";
import type { SetUserPermission } from "./types";
import getUser from "../users/get";

/** Use this as both create and update. */
export default async function setUserPermission(set: SetUserPermission) {
  await getUser(set.userId);

  const coll = await connectCollection("userPermissions");

  const result = await coll.updateOne(
    {
      userId: set.userId,
      permissionId: set.permissionId,
    },
    {
      $setOnInsert: {
        userId: set.userId,
        permissionId: set.permissionId,
        createdAt: new Date(),
      },
      $set: {
        active: set.active ?? true,
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
    }
  );

  if (result.matchedCount && !result.upsertedCount && !result.modifiedCount) {
    throw new Error("failed to create permission");
  }

  return true;
}

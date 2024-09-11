import type { ObjectId } from "mongodb";
import connectCollection, { stringToObjectId } from "../database/mongo";
import type { ListUserPermission } from "./types";
import { PermissionsEnumReverse } from "../../global/interfaces/permissions";

export default async function listUserPermissions(
  userId: ObjectId | string
): Promise<ListUserPermission[]> {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new Error("invalid userId");
  }

  const coll = await connectCollection("userPermissions");

  const cursor = coll.find({
    userId: userObjId,
  });

  const perms: ListUserPermission[] = [];

  while (await cursor.hasNext()) {
    const item = await cursor.next();

    if (!item || !item._id) {
      continue;
    }

    perms.push({
      id: item._id.toString(),
      permissionId: item.permissionId.toString(),
      name: PermissionsEnumReverse[item.permissionId.toString()] || "unknown",
      active: item.active || false,
      createdAt: item.createdAt.getTime(),
      updatedAt: item.updatedAt.getTime(),
    });
  }

  return perms;
}

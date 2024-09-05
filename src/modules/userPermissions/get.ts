import type { ObjectId } from "mongodb";
import connectCollection, { stringToObjectId } from "../database/mongo";
import getUser from "../users/get";

export default async function userHasPermission(
  userId: ObjectId | string,
  permissionId: string
) {
  await getUser(userId);

  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new Error("invalid userId");
  }

  const permObjId = await stringToObjectId(permissionId);

  if (!permObjId) {
    throw new Error("invalid permissionId");
  }

  const coll = await connectCollection("userPermissions");

  const hasPerm = await coll.findOne({
    userId: userObjId,
    permissionId: permObjId,
  });

  return hasPerm?.active === true;
}

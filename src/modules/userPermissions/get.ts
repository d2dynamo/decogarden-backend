import type { ObjectId } from "mongodb";
import connectCollection from "../database/mongo";
import getUser from "../users/get";

export default async function userHasPermission(
  userId: ObjectId,
  permissionId: ObjectId
) {
  await getUser(userId);

  const coll = await connectCollection("userPermissions");

  const hasPerm = await coll.findOne({
    userId: userId,
    permissionId: permissionId,
  });

  return hasPerm?.active === true;
}

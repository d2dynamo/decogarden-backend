import type { ObjectId } from "mongodb";
import connectCollection, {
  stringToObjectId,
  stringToObjectIdSync,
} from "../database/mongo";
import getUser from "../users/get";
import { PermissionsEnum } from "../../global/interfaces/permissions";

const customerObjId = stringToObjectIdSync(PermissionsEnum.customer);
const inventoryObjId = stringToObjectIdSync(PermissionsEnum.inventory);
const salesObjId = stringToObjectIdSync(PermissionsEnum.sales);
const adminObjId = stringToObjectIdSync(PermissionsEnum.admin);

function permissionHierarchy(permissionId: string) {
  if (!customerObjId || !inventoryObjId || !salesObjId || !adminObjId) {
    throw new Error("invalid permissionId, check permissions enum");
  }

  const hierarchy = {
    [PermissionsEnum.customer]: [
      customerObjId,
      inventoryObjId,
      salesObjId,
      adminObjId,
    ],
    [PermissionsEnum.inventory]: [inventoryObjId, adminObjId],
    [PermissionsEnum.sales]: [adminObjId, salesObjId],
    [PermissionsEnum.admin]: [adminObjId],
  };

  return hierarchy[permissionId];
}

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

  const cursor = coll.find({
    userId: userObjId,
    permissionId: { $in: permissionHierarchy(permissionId) },
    active: true,
  });

  while (await cursor.hasNext()) {
    const item = await cursor.next();

    if (item && item._id) {
      return true;
    }
  }

  return false;
}

import type { ObjectId } from 'mongodb';
import connectCollection, {
  stringToObjectId,
  stringToObjectIdSync,
} from '../database/mongo';
import getUser from '../users/get';
import { PermissionsEnum } from '../../global/interfaces/permissions';

const customerObjId = stringToObjectIdSync(PermissionsEnum.customer);
const inventoryObjId = stringToObjectIdSync(PermissionsEnum.inventory);
const salesObjId = stringToObjectIdSync(PermissionsEnum.sales);
const adminObjId = stringToObjectIdSync(PermissionsEnum.admin);

// Returns an array of permissions that has access to the given permission
function permissionHierarchy(permissionId: string) {
  if (!customerObjId || !inventoryObjId || !salesObjId || !adminObjId) {
    throw new Error('invalid permissionId, check permissions enum');
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
  validPermissionId: string[]
) {
  await getUser(userId);
  console.log('checking user perms', userId, validPermissionId);

  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new Error('invalid userId');
  }

  const validPermIds: ObjectId[] = [];

  for (let i = 0; i < validPermissionId.length; i++) {
    const pid = await stringToObjectId(validPermissionId[i]);

    if (!pid) {
      throw new Error('invalid permissionId');
    }

    validPermIds.push(pid);
  }

  const coll = await connectCollection('userPermissions');

  const result = await coll.findOne({
    userId: userObjId,
    permissions: {
      $elemMatch: {
        id: { $in: validPermIds },
        active: true,
      },
    },
  });

  if (result && result._id) {
    return true;
  }

  return false;
}

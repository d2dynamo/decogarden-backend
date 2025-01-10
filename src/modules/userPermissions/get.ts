import type { ObjectId } from 'mongodb';
import connectCollection, { stringToObjectId } from '../database/mongo';
import { getUserBasic } from '../users';

const userHasPermission = async (
  userId: ObjectId | string,
  validPermissionIds: string[]
) => {
  await getUserBasic(userId);

  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new Error('invalid userId');
  }

  const validPermIds: ObjectId[] = [];

  for (let i = 0; i < validPermissionIds.length; i++) {
    const pid = await stringToObjectId(validPermissionIds[i]);

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
};

export default userHasPermission;

import connectCollection, { stringToObjectId } from '../database/mongo';
import type { SetUserPermission } from './types';
import getUser from '../users/get';

/** Use this as both create and update. */
export default async function addUserPermission(set: SetUserPermission) {
  await getUser(set.userId);

  const permObjId = await stringToObjectId(set.permissionId);
  const userObjId = await stringToObjectId(set.userId);

  if (!permObjId || !userObjId) {
    throw new Error('invalid id');
  }

  const coll = await connectCollection('userPermissions');

  const filter = { userId: userObjId };

  const update = {
    $set: {
      'permissions.$[permission].active': set.active ?? true,
      'permissions.$[permission].updatedAt': new Date(),
    },

    $push: {
      permissions: {
        $each: [
          {
            id: permObjId,
            active: set.active ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        $position: 0,
      },
    },
  };

  const options = { arrayFilters: [{ 'permission.id': permObjId }] };

  const result = await coll.updateOne(filter, update, options);

  if (result.matchedCount && !result.upsertedCount && !result.modifiedCount) {
    throw new Error('failed to create permission');
  }

  return true;
}

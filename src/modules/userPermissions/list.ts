import type { ObjectId } from 'mongodb';
import connectCollection, { stringToObjectId } from '../database/mongo';
import type { FListUserPermissions, UserPermission } from './types';
import { PermissionsEnum } from '../../global/interfaces/permissions';

const listUserPermissions: FListUserPermissions = async (
  userId: ObjectId | string
) => {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new Error('invalid userId');
  }

  const coll = await connectCollection('userPermissions');

  const doc = await coll.findOne({
    userId: userObjId,
  });

  if (!doc || !doc._id || !doc.permissions) {
    return [];
  }

  const perms: UserPermission[] = doc.permissions.map((i) => {
    return {
      id: String(i.id),
      name: PermissionsEnum[String(i.id)],
      active: i.active,
      createdAt: i.createdAt.getTime(),
      updatedAt: i.updatedAt.getTime(),
    };
  });

  return perms;
};

export default listUserPermissions;

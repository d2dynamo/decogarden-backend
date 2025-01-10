import connectCollection, { stringToObjectId } from '../database/mongo';
import { UserError } from '../../util/error';
import type { FSetUser, FArchiveUser } from './types';
import type { ObjectId } from 'mongodb';

const setUser: FSetUser = async (user) => {
  const uoid = await stringToObjectId(user.id);
  if (!uoid) {
    throw new Error(`invalid userId: ${user.id}`);
  }

  const coll = await connectCollection('users');

  const filter = { _id: uoid };

  const update: Record<string, any> = { ...user, updatedAt: new Date() };
  delete update.id;

  const result = await coll.updateOne(filter, { $set: update });

  if (!result.matchedCount) {
    throw new UserError(`User does not exist`, 404);
  }

  return true;
};

const archiveUser: FArchiveUser = async (id: ObjectId | string) => {
  const uoid = await stringToObjectId(id);
  if (!uoid) {
    throw new Error(`invalid userId: ${id}`);
  }

  const coll = await connectCollection('users');

  const filter = { _id: uoid };

  const result = await coll.updateOne(filter, {
    $set: { archivedAt: new Date() },
  });

  if (!result.matchedCount) {
    throw new Error(`User does not exist`);
  }

  if (!result.acknowledged) {
    throw new Error(`Error archiving user`);
  }

  return true;
};

export { setUser, archiveUser };

import type { ObjectId } from 'mongodb';
import connectCollection, { stringToObjectId } from '../database/mongo';
import { UserError } from '../../util/error';
import type { FGetUser, FGetUserBasic } from './types';

const getUser: FGetUser = async (input) => {
  const filter: { _id?: ObjectId; email?: string } = {};

  if (input.id) {
    const uoid = await stringToObjectId(input.id);
    if (!uoid) {
      throw new Error(`invalid userId: ${input.id}`);
    }
    filter._id = uoid;
  }
  if (input.email) {
    filter.email = input.email;
  }
  if (!filter._id && !filter.email) {
    throw new Error('missing userId or email');
  }

  const coll = await connectCollection('users');

  const result = await coll.findOne(filter, {
    projection: { hash: 0, authSecret: 0 },
  });

  if (!result || !result._id) {
    throw new UserError(`User does not exist`, 404);
  }

  return {
    id: String(result._id),
    userName: result.userName,
    email: result.email,
    emailVerify: result.emailVerify,
    phone: result.phone || undefined,
    phoneVerify:
      typeof result.phoneVerify === 'boolean' ? result.phoneVerify : undefined,
    lastLogin: result.lastLogin?.getTime() || undefined,
    lastLoginAttempt: result.lastLoginAttempt?.getTime() || undefined,
    createdAt: result.createdAt.getTime(),
    updatedAt: result.updatedAt.getTime(),
  };
};

const getUserBasic: FGetUserBasic = async (id) => {
  const uoid = await stringToObjectId(id);
  if (!uoid) {
    throw new Error(`invalid userId: ${id}`);
  }

  const coll = await connectCollection('users');

  const result = await coll.findOne(
    { _id: uoid, archivedAt: { $exists: false } },
    { projection: { _id: 0, userName: 1, email: 1 } }
  );

  if (!result || !result._id) {
    throw new UserError(`User does not exist`, 404);
  }

  return {
    userName: result.userName,
    email: result.email,
  };
};

export { getUser, getUserBasic };

import type { ObjectId } from 'mongodb';
import { UserError } from '../../util/error';
import connectCollection, { stringToObjectId } from '../database/mongo';
import { generateBase32Secret, totp } from '../totp';
import { redisClient } from '../database/redis';
import type {
  FDisable2fa,
  FEnable2fa,
  FGenerate2fa,
  FVerify2fa,
} from './types';

const generate2fa: FGenerate2fa = async (
  userId: ObjectId | string,
  password: string
) => {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne(
    { _id: userObjId },
    { projection: { hash: 1 } }
  );

  if (!user) {
    throw new UserError('User not found', 404);
  }

  if (!user.hash) {
    throw new UserError('User has no password', 400);
  }

  const validPassword = await Bun.password.verify(user.hash, password);

  if (!validPassword) {
    throw new UserError('Invalid password', 400);
  }

  const newSecret = generateBase32Secret();

  const redis = await redisClient();

  await redis.set(`2fa:${String(userId)}`, newSecret, 'EX', 60 * 5);

  return newSecret;
};

const enable2fa: FEnable2fa = async (
  userId: ObjectId | string,
  code: string
) => {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne(
    { _id: userObjId },
    { projection: { authSecret: 1 } }
  );

  if (!user) {
    throw new UserError('User not found', 404);
  }

  const redis = await redisClient();

  const secret = await redis.get(`2fa:${String(userId)}`);

  if (!secret) {
    throw new UserError('Period expired', 400);
  }

  const validCodes = await totp(secret, 4, 1);

  if (!validCodes.includes(code)) {
    throw new UserError('Invalid code', 400);
  }

  const result = await coll.updateOne(
    { _id: userObjId },
    {
      $set: {
        authSecret: secret,
        updatedAt: new Date(),
      },
    }
  );

  if (!result.modifiedCount) {
    throw new Error('Failed to enable 2fa');
  }

  return true;
};

const verify2fa: FVerify2fa = async (
  userId: ObjectId | string,
  code: string
) => {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne(
    { _id: userObjId },
    { projection: { authSecret: 1 } }
  );

  if (!user) {
    throw new UserError('User not found', 404);
  }

  const validCodes = await totp(user.authSecret, 2, 1);

  if (!validCodes.includes(code)) {
    throw new UserError('Invalid code', 400);
  }

  return true;
};

const disable2fa: FDisable2fa = async (
  userId: ObjectId | string,
  password: string
) => {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne(
    { _id: userObjId },
    { projection: { hash: 1 } }
  );

  if (!user) {
    throw new UserError('User not found', 404);
  }

  if (!user.authSecret) {
    throw new UserError('2fa not enabled', 400);
  }

  if (!user.hash) {
    throw new UserError('User has no password', 400);
  }

  const validPassword = await Bun.password.verify(user.hash, password);

  if (!validPassword) {
    throw new UserError('Invalid password', 400);
  }

  const result = await coll.updateOne(
    { _id: userObjId },
    {
      $unset: {
        authSecret: '',
      },
    }
  );

  if (!result.modifiedCount) {
    throw new Error('Failed to disable 2fa');
  }

  return true;
};

export { generate2fa, enable2fa, verify2fa, disable2fa };

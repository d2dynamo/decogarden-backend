import type { ObjectId } from 'mongodb';
import { UserError } from '../../util/error';
import connectCollection, { stringToObjectId } from '../database/mongo';
import { generateBase32Secret, totp } from '../totp';
import { redisClient } from '../database/redis';

export async function generate2fa(userId: ObjectId | string, password: string) {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne({ _id: userObjId });

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

  await redis.set(`2fa:${String(userId)}`, newSecret, 'EX', 60 * 10);

  return newSecret;
}

export async function enable2fa(userId: ObjectId | string, token: string) {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne({ _id: userObjId });

  if (!user) {
    throw new UserError('User not found', 404);
  }

  const redis = await redisClient();

  const secret = await redis.get(`2fa:${String(userId)}`);

  if (!secret) {
    throw new UserError('Secret expired', 400);
  }

  const validToken = await totp(secret, 3, 1);

  if (!validToken.includes(token)) {
    throw new UserError('Invalid token', 400);
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
}

export async function verify2fa(userId: ObjectId | string, token: string) {
  const userObjId = await stringToObjectId(userId);

  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne({ _id: userObjId });

  if (!user) {
    throw new UserError('User not found', 404);
  }

  const validToken = await totp(user.authSecret, 2, 1);

  if (!validToken.includes(token)) {
    throw new UserError('Invalid token', 400);
  }

  return true;
}

import { UserError } from '../../util/error';
import genSimpleKey from '../../util/simpleToken';
import connectCollection from '../database/mongo';
import { redisClient } from '../database/redis';
import SgMailer from '../mailer';
import { SendgridTemplates } from '../mailer/templates';
import type { FCreateUser } from './types';

const createUser: FCreateUser = async (input) => {
  const coll = await connectCollection('users');

  const { email, userName, password, phone } = input;

  const checkUsed = await coll.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (checkUsed) {
    throw new UserError(`email or username already used`, 409);
  }

  const hash = await Bun.password.hash(password, {
    algorithm: 'argon2id',
    timeCost: 3,
    memoryCost: 65536,
  });

  const set = {
    email: email,
    userName: userName,
    hash: hash,
    emailVerify: false,
    ttl: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (phone) {
    set['phone'] = phone;
    set['phoneVerified'] = false;

    // when twilio set up add phone nr verification
  }

  const result = await coll.insertOne(set);

  if (!result.insertedId) {
    throw new Error('failed to create user');
  }

  const redis = await redisClient();

  const verifyToken = genSimpleKey();

  await redis.set(
    `verify:${verifyToken}`,
    String(result.insertedId),
    'EX',
    60 * 60 * 24 * 1
  );

  const sgMailer = SgMailer.getInstance();
  await sgMailer.sendTemplateEmail(email, SendgridTemplates.verifyEmail, {
    verification_code: verifyToken,
  });

  return String(result.insertedId);
};

export default createUser;

import { PermissionsEnum } from '../../global/interfaces/permissions';
import { UserError } from '../../util/error';
import genSimpleKey from '../../util/simpleToken';
import connectCollection, { stringToObjectId } from '../database/mongo';
import { redisClient } from '../database/redis';
import SgMailer from '../mailer';
import { SendgridTemplates } from '../mailer/templates';
import addUserPermission from '../userPermissions/create';

// TODO when twilio set up add phone nr verification
export default async function verifyUser(token: string): Promise<boolean> {
  const redis = await redisClient();

  const userId = await redis.get(`verify:${token}`);
  if (!userId) {
    throw new UserError('Token expired', 400);
  }

  const userObjId = await stringToObjectId(userId);
  if (!userObjId) {
    throw new Error('Invalid user id');
  }

  const coll = await connectCollection('users');

  const result = await coll.updateOne(
    { _id: userObjId },
    {
      $set: {
        emailVerify: true,
        updatedAt: new Date(),
      },
      $unset: {
        ttl: '',
      },
    }
  );

  if (!result.matchedCount) {
    throw new UserError('User not found', 404);
  }

  await addUserPermission({
    userId: userObjId,
    permissionId: PermissionsEnum.customer,
    active: true,
  });

  await redis.del(`verify:${token}`);

  return true;
}

export async function resendVerify(
  userId: string,
  option: { email?: string; phone?: string }
) {
  if (!option.email && !option.phone) {
    throw new UserError('Invalid option', 400);
  }

  const userObjId = await stringToObjectId(userId);
  if (!userObjId) {
    throw new UserError('Invalid user id', 400);
  }

  const coll = await connectCollection('users');

  const user = await coll.findOne({ _id: userObjId });

  if (!user) {
    throw new UserError('User not found', 404);
  }

  if (user.emailVerify) {
    throw new UserError('Email already verified', 400);
  }

  const redis = await redisClient();

  const verifyToken = genSimpleKey();

  if (option.email) {
    await redis.set(
      `verify:${verifyToken}`,
      option.email,
      'EX',
      60 * 60 * 24 * 1
    );

    const sgMailer = SgMailer.getInstance();
    await sgMailer.sendTemplateEmail(
      option.email,
      SendgridTemplates.verifyEmail,
      {
        verification_code: verifyToken,
      }
    );
  }

  if (option.phone) {
    // when twilio set up add phone nr verification
  }

  return true;
}

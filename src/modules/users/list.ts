import connectCollection from '../database/mongo';
import type { FListUsers, User } from './types';

const listUsers: FListUsers = async (filter?, listOpts?) => {
  const coll = await connectCollection('users');

  const query: any = {
    archivedAt: { $exists: false },
  };

  if (filter?.userName) {
    query.userName = { $regex: filter.userName, $options: 'i' };
  }
  if (filter?.email) {
    query.email = { $regex: filter.email, $options: 'i' };
  }
  if (filter?.mustBeVerified) {
    query.emailVerify = true;
  }

  const projection: any = {
    _id: 1,
    userName: 1,
    email: 1,
  };

  const page = listOpts?.page || 1;
  const pageSize = listOpts?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const cursor = coll
    .find(query, { projection })
    .sort(listOpts?.sort || { createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  const users: Pick<User, 'id' | 'userName' | 'email'>[] = [];
  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    users.push({
      id: String(doc._id),
      userName: doc.userName,
      email: doc.email,
    });
  }

  return users;
};

export default listUsers;

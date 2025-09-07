import connectCollection, { stringToObjectId } from "./mongo";
import type { ListUserDoc, UserLayer } from "./types";
import { UserError } from "util/error";
import {
  USER_SECURE_PROJECTION,
  USER_LIST_PROJECTION,
  USER_PUBLIC_PROJECTION,
} from "global/const";

const create: UserLayer["create"] = async (data) => {
  const coll = await connectCollection("users");

  const exists = await coll.findOne(
    {
      $or: [{ userName: data.userName }, { email: data.email }],
    },
    { projection: { _id: 1 } }
  );

  if (exists) {
    throw new UserError(
      `User with username or email already exists: ${data.userName}|${data.email}`
    );
  }

  return await coll.insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

const get: UserLayer["get"] = async (id, opts) => {
  const uoid = await stringToObjectId(id);
  if (!uoid) {
    throw new Error(`invalid userId: ${id}`);
  }

  const coll = await connectCollection("users");

  // Default security projection - exclude sensitive fields by default
  const projection = opts?.projection
    ? { ...USER_SECURE_PROJECTION, ...opts.projection }
    : USER_SECURE_PROJECTION;

  const result = await coll.findOne(
    { _id: uoid },
    {
      ...opts,
      projection,
    }
  );

  if (!result) throw new Error(`Error finding user with id: ${String(id)}`);
  return result;
};

const findOne: UserLayer["findOne"] = async (filter, opts) => {
  const coll = await connectCollection("users");

  const projection = opts?.projection
    ? { ...USER_PUBLIC_PROJECTION, ...opts.projection }
    : USER_PUBLIC_PROJECTION;

  const result = coll.findOne(filter, {
    ...opts,
    projection,
  });

  return result;
};

const list: UserLayer["list"] = async (filter, opts) => {
  const coll = await connectCollection("users");

  const projection = opts?.projection
    ? { ...USER_LIST_PROJECTION, ...opts.projection }
    : USER_LIST_PROJECTION;

  const cursor = coll.find(
    { archivedAt: { $exists: false }, ...filter },
    {
      ...opts,
      projection,
    }
  );

  const users: ListUserDoc[] = [];
  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    users.push({
      _id: String(doc._id),
      userName: doc.userName,
      email: doc.email,
    });
  }

  return users;
};

const update: UserLayer["update"] = async (id, uFilter, opts) => {
  const uoid = await stringToObjectId(id);
  if (!uoid) {
    throw new Error(`invalid userId: ${id}`);
  }

  const coll = await connectCollection("users");

  return await coll.updateOne(
    { _id: uoid },
    { ...uFilter, updatedAt: new Date() },
    opts
  );
};

export default {
  create,
  get,
  list,
  findOne,
  update,
} as UserLayer;

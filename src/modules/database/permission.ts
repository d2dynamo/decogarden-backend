import { connect } from "bun";
import connectCollection, { stringToObjectId } from "./mongo";

import type { PermissionLayer } from "./types";

const listAvailable: PermissionLayer["listAvailable"] = async (
  filter,
  opts
) => {
  const coll = await connectCollection("permissions");
  return await coll.find().toArray();
};

const findOne: PermissionLayer["findOne"] = async (filter) => {
  const coll = await connectCollection("userPermissions");

  return await coll.findOne(filter);
};

const getUserPermissions: PermissionLayer["getUserPermissions"] = async (
  userId
) => {
  const uoid = stringToObjectId(userId);

  if (!uoid) {
    throw new Error(`invalid userId: ${userId}`);
  }

  const coll = await connectCollection("userPermissions");

  return await coll.findOne({ userId: uoid });
};

const update: PermissionLayer["update"] = async (userId, data, opts) => {
  const uoid = stringToObjectId(userId);
  if (!uoid) {
    throw new Error(`invalid userId: ${userId}`);
  }

  const coll = await connectCollection("userPermissions");

  return await coll.updateOne({ userId: uoid }, data, {
    upsert: true,
    ...opts,
  });
};

export default {
  listAvailable,
  findOne,
  getUserPermissions,
  update,
} as PermissionLayer;

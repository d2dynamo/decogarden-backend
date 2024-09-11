import type { ObjectId } from "mongodb";
import connectCollection, {
  stringToObjectId,
  stringToObjectIdForce,
} from "../database/mongo";
import { UserError } from "../../util/error";

interface User {
  id: ObjectId;
  email: string;
  createdAt: number; //unix milis
  updatedAt: number; //unix milis
}

export default async function getUser(id: ObjectId | string): Promise<User> {
  const userObjId = await stringToObjectId(id);

  if (!userObjId) {
    throw new Error(`invalid userId: ${id}`);
  }

  const coll = await connectCollection("users");

  const result = await coll.findOne({ _id: userObjId });

  if (!result) {
    throw new UserError(`User with id: ${id} does not exist`, 404);
  }

  return {
    id: result._id,
    email: result.email,
    createdAt: result.createdAt.getTime(),
    updatedAt: result.updatedAt.getTime(),
  };
}

export async function getUserEmail(email: string): Promise<User | false> {
  const coll = await connectCollection("users");

  const result = await coll.findOne({ email: email });

  if (!result) {
    return false;
  }

  return {
    id: result._id,
    email: result.email,
    createdAt: result.createdAt.getTime(),
    updatedAt: result.updatedAt.getTime(),
  };
}

import type { ListOptions } from "../../global/interfaces/controller";
import connectCollection from "../database/mongo";
import type { ListUser, ListUserFilter, ListUserSorts } from "./types";

export default async function listUsers(
  filter?: ListUserFilter,
  listOpts?: ListOptions<ListUserSorts>
): Promise<ListUser[]> {
  const coll = await connectCollection("users");

  const query: any = {};

  if (filter?.userName) {
    query.userName = { $regex: filter.userName, $options: "i" };
  }
  if (filter?.email) {
    query.email = { $regex: filter.email, $options: "i" };
  }

  const sort: any = {};
  if (listOpts?.sort) {
    const keys = Object.keys(listOpts.sort);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      sort[k] = listOpts.sort[k];
    }
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
    .sort(sort)
    .skip(skip)
    .limit(pageSize);

  const users: ListUser[] = [];
  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    users.push({
      id: doc._id,
      userName: doc.userName,
      email: doc.email,
    });
  }

  return users;
}

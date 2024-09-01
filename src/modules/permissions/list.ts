import type { ObjectId } from "mongodb";
import connectCollection from "../database/mongo";

interface PermissionItem {
  id: ObjectId;
  name: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export default async function () {
  const coll = await connectCollection("permissions");

  const cursor = coll.find({});

  const perms: PermissionItem[] = [];

  while (await cursor.hasNext()) {
    const item = await cursor.next();

    if (!item || !item._id) {
      continue;
    }

    perms.push({
      id: item._id,
      name: item.name || "unknown permission",
      active: item.active || false,
      createdAt: item.createdAt.getTime(),
      updatedAt: item.updatedAt.getTime(),
    });
  }

  return perms;
}

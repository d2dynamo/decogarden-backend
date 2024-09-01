import connectCollection from "../database/mongo";
import type { ListPermission } from "./types";

export default async function () {
  const coll = await connectCollection("permissions");

  const cursor = coll.find({});

  const perms: ListPermission[] = [];

  while (await cursor.hasNext()) {
    const item = await cursor.next();

    if (!item || !item._id) {
      continue;
    }

    perms.push({
      id: item._id.toString(),
      name: item.name || "unknown permission",
      active: item.active || false,
      createdAt: item.createdAt.getTime(),
      updatedAt: item.updatedAt.getTime(),
    });
  }

  return perms;
}

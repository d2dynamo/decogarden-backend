import connectCollection from "../database/mongo";
import type { AddPermission } from "./types";

export default async function (addPerm: AddPermission) {
  const coll = await connectCollection("permissions");

  const result = await coll.insertOne({
    name: addPerm.name,
    active: addPerm.active ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!result.acknowledged) {
    throw new Error("failed to insert permission");
  }

  return result.insertedId;
}

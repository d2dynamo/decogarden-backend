import connectCollection from "../database/mongo";

export default async function (name: string) {
  const coll = await connectCollection("permissions");

  const result = await coll.insertOne({
    name: name,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!result.acknowledged) {
    throw new Error("failed to insert permission");
  }

  return result.insertedId;
}

import type { ObjectId } from "mongodb";
import connectCollection, { stringToObjectId } from "../database/mongo";
import { UserError } from "../../util/error";
import type { UpdateItem } from "../../global/interfaces/item";

export async function updateItem(
  itemId: ObjectId | string,
  update: UpdateItem
) {
  const itemObjId = await stringToObjectId(itemId);

  if (!itemObjId) {
    throw new Error(`invalid item id: ${itemId}`);
  }
  const coll = await connectCollection("items");

  const result = await coll.updateOne(
    { _id: itemObjId },
    {
      $set: {
        ...update,
        updatedAt: new Date(),
      },
    }
  );

  if (!result.acknowledged) {
    throw new Error(`failed to update item`);
  }

  if (!result.matchedCount) {
    throw new UserError(`item does not exist.`, 404);
  }

  if (!result.modifiedCount) {
    throw new UserError(`no changes made.`, 204);
  }

  return true;
}

import type { AddItem } from "../../global/interfaces/item";
import connectCollection from "../database/mongo";

/** Inserts new item. If failed to insert throws error.
 *
 * @param newItem {AddItem}
 * @returns boolean
 */
export async function addItem(newItem: AddItem) {
  const coll = await connectCollection("items");

  const insertDoc = {
    ...newItem,
    createdAt: new Date(),
    updatedAt: new Date(),
    amountStorage: newItem.amountStorage ?? 0,
  };

  const result = await coll.insertOne(insertDoc);

  if (!result.acknowledged) {
    throw new Error("Failed to insert item");
  }

  return true;
}
